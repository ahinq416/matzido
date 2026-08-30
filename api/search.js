// 네이버 검색 API 중계소
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const fullUrl = `${protocol}://${req.headers.host}${req.url}`;
    const parsedUrl = new URL(fullUrl);
    const query = parsedUrl.searchParams.get('query');

    if (!query) {
      return res.status(400).json({ error: '검색어(query)가 누락되었습니다.' });
    }

    // 1. 네이버 클라우드 플랫폼(API HUB) 최신 지역 검색 주소로 변경
    const naverUrl = `https://naverapihub.apigw.ntruss.com/search/v1/local?query=${encodeURIComponent(query)}&display=5`;
    
    // 2. 네이버 클라우드 플랫폼 전용 최신 헤더 규격으로 변경
    const response = await fetch(naverUrl, {
      method: 'GET',
      headers: {
        'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_CLIENT_ID,
        'X-NCP-APIGW-API-KEY': process.env.NAVER_CLIENT_SECRET,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return res.status(response.status).json({ error: '네이버 API 호출 실패', details: errorData });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('서버 에러:', error);
    return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
}
