import fetch from 'node-fetch';

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
    const response = await fetch(url, {
      method: event.httpMethod,
      headers: event.headers,
      body: event.body
    })

    

    const body = await response.text()

    return {
      statusCode: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
      },
      body
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    }
  }
}