import axios from 'axios';

export const handler = async (event, context) => {
  // 从环境变量获取目标 URL
  const targetUrl = process.env.TARGET_URL

  if (!targetUrl) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'TARGET_URL environment variable is not set' })
    }
  }

  try {
    // 构建完整的请求 URL
    const path = event.path.replace('/.netlify/functions/proxy', '')
    const url = `${targetUrl}${path}${event.queryStringParameters ? '?' + new URLSearchParams(event.queryStringParameters).toString() : ''}`
    console.log(url)

    // 转发请求
    const proxyUrl = process.env.HTTP_PROXY || process.env.HTTPS_PROXY
    const response = await axios(url, {
      method: event.httpMethod,
      headers: event.headers,
      data: event.body,
      proxy: proxyUrl ? {
        protocol: proxyUrl.startsWith('https') ? 'https' : 'http',
        host: new URL(proxyUrl).hostname,
        port: new URL(proxyUrl).port
      } : false,
      httpsAgent: proxyUrl ? new (await import('https-proxy-agent')).HttpsProxyAgent(proxyUrl, {
        rejectUnauthorized: false
      }) : null
    })

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': response.headers['content-type'] || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body: JSON.stringify(response.data)
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}