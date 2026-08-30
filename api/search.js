// 네이버 검색 API 중계소
export default async function handler(req, res) {
  // 1. 프론트엔드(index.html)에서 보낸 검색어(query)를 받음
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: '검색어가 없습니다.' });
  }

  // 2. Vercel 환경변수에서 네이버 API 키를 꺼내옴 (보안)
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  try {
    // 3. 네이버 지역 검색 API 찌르기 (최대 5개 결과만 가져오게 세팅)
    const url = `https://openapi.naver.com/v1/search/local.json?query=${encodeURIComponent(query)}&display=5`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      }
    });

    const data = await response.json();

    // 4. 네이버에서 받은 데이터를 그대로 다시 index.html로 넘겨줌
    return res.status(200).json(data);

  } catch (error) {
    console.error("검색 API 에러:", error);
    return res.status(500).json({ error: '서버에서 네이버 API 통신 중 에러가 발생했습니다.' });
  }
}
