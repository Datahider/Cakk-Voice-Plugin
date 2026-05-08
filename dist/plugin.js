const MAGIC = 'CAKK:VOICE:1\n';
const MAGIC_BYTES = new TextEncoder().encode(MAGIC);
const CANCEL_DELTA_X = -72;
const MICROPHONE_ICON_URL = 'data:image/png;base64,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';

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

function openVoiceView(voice) {
  const source = `data:${voice.mime};base64,${bytesToBase64(voice.body)}`;
  window.open(source, '_blank', 'noopener,noreferrer');
}

function renderOneTouchButtonIcon(hostApi) {
  return createElement(hostApi, 'img', {
    src: MICROPHONE_ICON_URL,
    alt: '',
    'aria-hidden': true,
    width: 20,
    height: 20,
    draggable: false,
  });
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
        buttonAriaLabel: 'Голосовое сообщение',
        renderButtonIcon() {
          return renderOneTouchButtonIcon(hostApi);
        },
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
        async getPushPreview() {
          return 'Голосовое сообщение';
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

      registry.registerMessageView({
        id: 'voice',
        priority: 100,
        canHandle,
        openView({ bytes }) {
          const voice = parseVoice(bytes);
          if (!voice) {
            return;
          }
          openVoiceView(voice);
        },
      });
    },
  };
}
