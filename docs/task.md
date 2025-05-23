# 대선 공약 매칭 웹사이트 작업 목록

## 1. 데이터 수집 & 검증
- [x] 후보 3명 확정 및 공약 원문 수집 (출처 URL 포함)
- [x] 10-12개의 동일 주제 묶음 정의
- [x] JSON 스키마로 변환, 사실관계 검토
- [x] 기호 번호 순서 적용 (이재명 1번, 김문수 2번, 이준석 4번)

## 2. UI/UX 설계
- [x] 와이어프레임 작성
  - [x] 문항 카드 디자인
  - [x] 진행바 디자인
  - [x] 결과 페이지 디자인
- [x] 모바일 우선 반응형 레이아웃 설계
- [x] 공약 비교 테이블 디자인
- [x] 비활성화된 공약 표시 스타일

## 3. 프론트엔드 개발
- [x] 프로젝트 초기화
  - [x] Vite/Astro 등 선택 및 설정
  - [x] 기본 디렉토리 구조 설정
- [x] 핵심 기능 구현
  - [x] promises.json fetch 및 설문 페이지 구현
  - [x] 점수 집계 로직 작성
  - [x] 로컬스토리지로 임시 결과 저장
  - [x] 결과 페이지 구현
  - [x] Kakao 공유 버튼 연동
  - [x] URL 암호화/복호화 구현
  - [x] 선택지 랜덤화 구현
  - [x] 공약 요약/상세 보기 토글
  - [x] 카테고리별 공약 비교 테이블

## 4. 성능 & 보안
- [ ] URL 암호화 강화
  - [ ] 더 강력한 암호화 알고리즘 적용
  - [ ] URL 길이 최적화
- [ ] 데이터 무결성 검증
  - [ ] 결과 데이터 검증 로직
  - [ ] 잘못된 URL 처리

## 5. 배포 파이프라인
- [x] GitHub Actions 설정
  - [x] push 시 자동 빌드 설정
  - [x] gh-pages 배포 자동화
- [ ] 도메인 설정
  - [ ] 사용자 도메인 (CNAME) 설정
  - [ ] Cloudflare 캐싱 최적화
- [ ] 성능 최적화
  - [ ] Lighthouse 체크
  - [ ] FCP < 2s 목표
  - [ ] 총 사이즈 < 200KB 목표

## 6. 테스트 & 런칭
- [ ] 브라우저 호환성 테스트
  - [ ] Chrome
  - [ ] Safari
  - [ ] Edge
  - [ ] 모바일 브라우저
- [ ] 접근성 테스트
  - [ ] 키보드 네비게이션
  - [ ] 스크린리더 지원
- [ ] 베타 테스트
  - [ ] 익명 베타 테스터 모집
  - [ ] 피드백 수집 및 반영
- [ ] 최종 점검
  - [ ] 최종 법적 리뷰
  - [ ] 공개 준비 완료 