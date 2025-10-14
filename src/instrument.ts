import * as Sentry from '@sentry/browser'

Sentry.init({
  dsn: `${location.protocol}//${globalConfig.sentryDsn}@${location.host}/${globalConfig.sentryProjectId}`,
  sendDefaultPii: true,

  beforeSend: (event) => {
    event.tags = {
      ...event.tags,
      username: localStorage.getItem('username'),
      token: localStorage.getItem('token'),
    }
    return event
  },

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur
})
