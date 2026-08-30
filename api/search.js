// 네이버 검색 API 중계소
export default async function handler(req, res) {
  // CORS 허용 설정
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
    // 최신 표준인 WHATWG URL API를 사용하여 쿼리 파라미터 추출 (경고 해결)
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const fullUrl = `${protocol}://${req.headers.host}${req.url}`;
    const parsedUrl = new URL(fullUrl);
    const query = parsedUrl.searchParams.get('query');

    if (!query) {
      return res.status(400).json({ error: '검색어(query)가 누락되었습니다.' });
    }

    // 네이버 지역 검색 API 호출
    const naverUrl = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5`;
    
    const response = await fetch(naverUrl, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': process.env.NAVER_CLIENT_ID,
        'X-Naver-Client-Secret': process.env.NAVER_CLIENT_SECRET,
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
