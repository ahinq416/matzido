//연습용
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

    // 네이버 클라우드 플랫폼(API HUB) 이미지 검색 최신 주소 (사진 10장 뽑기)
    const naverUrl = `https://naverapihub.apigw.ntruss.com/search/v1/image?query=${encodeURIComponent(query)}&display=10`;
    
    // 네이버 클라우드 전용 인증키 + 출처 명찰(Referer) 장착
    const response = await fetch(naverUrl, {
      method: 'GET',
      headers: {
        'X-NCP-APIGW-API-KEY-ID': process.env.NAVER_CLIENT_ID,
        'X-NCP-APIGW-API-KEY': process.env.NAVER_CLIENT_SECRET,
        'Referer': 'https://matzido-zeta.vercel.app/',  
        'User-Agent': 'Mozilla/5.0'                   
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      return res.status(response.status).json({ error: '이미지 검색 API 호출 실패', details: errorData });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('서버 에러:', error);
    return res.status(500).json({ error: '서버 내부 오류가 발생했습니다.' });
  }
}
