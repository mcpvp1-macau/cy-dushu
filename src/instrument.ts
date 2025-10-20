import * as Sentry from '@sentry/browser'

console.log('globalConfig.sentryDsn', globalConfig.sentryDsn)

Sentry.init({
  dsn: `${location.protocol}//${globalConfig.sentryDsn}@${location.host}/${globalConfig.sentryProjectId}`,
  sendDefaultPii: true,

  // 增加username和token到tags
  beforeSend: (event, hint) => {
    console.log('username', localStorage.getItem('username'))

    try {
      const message = JSON.parse((hint?.originalException as any)?.message)
      event.message = message.message
      if (message.code !== 'SUCCESS') {
        // return null
      }
    } catch (error) {
      console.log('beforeSend', (hint?.originalException as any)?.message)
    }
    event.tags = {
      ...event.tags,
      'user.name': localStorage.getItem('username') || '',
      token: localStorage.getItem('token') || '',
    }
    return event
  },
  // 忽略部分异常，用正则表达式
  // ignoreErrors: ['NetworkError'],

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur
})
