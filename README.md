# 나와 맞는 대선 후보 찾기

대선 후보들의 공약을 비교하고 나와 가장 잘 맞는 후보를 찾아보세요.

## 기능

- 10-12개의 주요 공약 주제별 비교
- 모바일 친화적인 반응형 디자인
- 실시간 진행 상태 표시
- 결과 공유 기능 (카카오톡)

## 기술 스택

- Vanilla JavaScript
- Tailwind CSS
- GitHub Pages

## 로컬 개발 환경 설정

1. 저장소 클론
```bash
git clone [repository-url]
cd my-president
```

2. 로컬 서버 실행
```bash
python3 -m http.server 8000
```

3. 브라우저에서 확인
```
http://localhost:8000
```

## 배포

GitHub Actions를 통해 자동으로 배포됩니다. main 브랜치에 push하면 자동으로 gh-pages 브랜치에 배포됩니다.

## 라이선스

MIT License 