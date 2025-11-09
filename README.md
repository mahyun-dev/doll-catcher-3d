# 3D 인형뽑기 게임 (3D Doll Catcher Game)

Three.js를 활용한 3D 인형뽑기 게임입니다.

## 🎮 게임 소개

브라우저에서 즐기는 3D 인형뽑기 게임! 집게를 조작하여 알록달록한 인형들을 잡아보세요.

## 🚀 실행 방법

### 간단한 방법
1. `index.html` 파일을 브라우저에서 직접 열기

### 로컬 서버 사용
```bash
# Python 3가 설치되어 있다면
python3 -m http.server 8080

# 또는 Node.js의 http-server 사용
npx http-server
```

그 다음 브라우저에서 `http://localhost:8080` 접속

## 🎯 게임 방법

1. **이동 버튼**으로 집게를 이동
   - ▲ 앞으로
   - ▼ 뒤로
   - ◄ 왼쪽
   - ► 오른쪽

2. **⬇ 잡기** 버튼으로 인형 잡기

3. **🔄 리셋** 버튼으로 게임 초기화

## 🛠 기술 스택

- **HTML5**: 게임 구조
- **CSS3**: UI 스타일링
- **JavaScript**: 게임 로직
- **Three.js v0.137.0**: 3D 렌더링

## ✨ 주요 기능

- 🎨 3D 그래픽 렌더링
- 🕹️ 직관적인 집게 조작
- 🎯 충돌 감지 및 점수 시스템
- 🌈 다양한 색상의 인형들
- ♻️ 게임 리셋 기능

## 📦 프로젝트 구조

```
doll-catcher-3d/
├── index.html      # 메인 HTML
├── style.css       # 스타일시트
├── game.js         # 게임 로직
├── three.min.js    # Three.js 라이브러리
└── package.json    # 의존성 관리
```

## 🔒 보안

- Three.js v0.137.0 (보안 취약점 수정)
- CodeQL 보안 스캔 통과

## 📝 라이선스

ISC