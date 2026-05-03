const MAGIC = 'CAKK:VOICE:1\n';
const MAGIC_BYTES = new TextEncoder().encode(MAGIC);
const CANCEL_DELTA_X = -72;

function createElement(hostApi, type, props, children) {
  if (typeof hostApi?.createElement !== 'function') {
    throw new Error('Host API must provide createElement()');
  }

  return hostApi.createElement(type, props, children);
}

function concatBytes(left, right) {
  const next = new Uint8Array(left.length + right.length);
  next.set(left, 0);
  next.set(right, left.length);
  return next;
}

function startsWithMagic(bytes) {
  if (!(bytes instanceof Uint8Array) || bytes.length < MAGIC_BYTES.length) {
    return false;
  }

  for (let index = 0; index < MAGIC_BYTES.length; index += 1) {
    if (bytes[index] !== MAGIC_BYTES[index]) {
      return false;
    }
  }

  return true;
}

function findHeaderDivider(bytes, start) {
  for (let index = start; index < bytes.length - 1; index += 1) {
    if (bytes[index] === 10 && bytes[index + 1] === 10) {
      return index;
    }
  }
  return -1;
}

function bytesToBase64(bytes) {
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

function parseVoice(bytes) {
  if (!startsWithMagic(bytes)) {
    return null;
  }

  const dividerIndex = findHeaderDivider(bytes, MAGIC_BYTES.length);
  if (dividerIndex < 0) {
    return null;
  }

  const mime = new TextDecoder().decode(bytes.slice(MAGIC_BYTES.length, dividerIndex)).trim();
  const body = bytes.slice(dividerIndex + 2);
  if (!mime || !body.length) {
    return null;
  }

  return { mime, body };
}

function chooseMimeType() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
  ];
  return candidates.find((candidate) => window.MediaRecorder?.isTypeSupported?.(candidate)) || '';
}

async function stopRecorder(session) {
  if (session.recorder.state === 'inactive') {
    return session.stopPromise;
  }
  session.recorder.stop();
  return session.stopPromise;
}

export function createCakkPlugin(hostApi) {
  return {
    id: 'voice',
    title: 'Voice',
    register(registry) {
      registry.registerOneTouch({
        id: 'voice',
        title: 'Voice',
        buttonLabel: 'Voice',
        priority: 100,
        async begin() {
          if (!navigator.mediaDevices?.getUserMedia || typeof window.MediaRecorder !== 'function') {
            throw new Error('Voice recording is not supported in this browser');
          }

          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const mimeType = chooseMimeType();
          const chunks = [];
          const recorder = mimeType
            ? new window.MediaRecorder(stream, { mimeType })
            : new window.MediaRecorder(stream);

          const stopPromise = new Promise((resolve, reject) => {
            recorder.addEventListener('dataavailable', (event) => {
              if (event.data && event.data.size > 0) {
                chunks.push(event.data);
              }
            });
            recorder.addEventListener('error', () => {
              reject(new Error('Voice recorder failed'));
            });
            recorder.addEventListener('stop', async () => {
              try {
                const blob = new Blob(chunks, {
                  type: recorder.mimeType || mimeType || 'audio/webm',
                });
                const bytes = new Uint8Array(await blob.arrayBuffer());
                resolve({
                  mime: blob.type || 'audio/webm',
                  bytes,
                });
              } catch (error) {
                reject(error);
              } finally {
                stream.getTracks().forEach((track) => track.stop());
              }
            });
          });

          recorder.start();
          return {
            recorder,
            stopPromise,
            cancelled: false,
          };
        },
        async move(session, context) {
          if (context.deltaX <= CANCEL_DELTA_X) {
            session.cancelled = true;
          }
        },
        async cancel(session) {
          session.cancelled = true;
          await stopRecorder(session).catch(() => null);
        },
        async complete(session) {
          const result = await stopRecorder(session);
          if (session.cancelled || !result?.bytes?.length) {
            return null;
          }

          const header = new TextEncoder().encode(`${MAGIC}${result.mime}\n\n`);
          return {
            bytes: concatBytes(header, result.bytes),
            metaEntries: [{ content_type: result.mime }],
          };
        },
      });

      const canHandle = ({ bytes }) => Boolean(parseVoice(bytes));

      registry.registerPreview({
        id: 'voice',
        priority: 100,
        canHandle,
        renderPreview() {
          return 'Голосовое сообщение';
        },
      });

      registry.registerMessageRender({
        id: 'voice',
        priority: 100,
        canHandle,
        renderMessage({ bytes }) {
          const voice = parseVoice(bytes);
          if (!voice) {
            return createElement(hostApi, 'span', null, 'Voice payload error');
          }

          const source = `data:${voice.mime};base64,${bytesToBase64(voice.body)}`;
          return createElement(hostApi, 'audio', {
            className: 'message-voice-audio',
            src: source,
            controls: true,
            preload: 'metadata',
          });
        },
      });
    },
  };
}
