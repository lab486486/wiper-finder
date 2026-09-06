# Play Store TWA (Trusted Web Activity)

Android 앱 패키지: `com.wiperfinder.app`  
웹 manifest: https://wiper-finder.com/manifest.json  
Digital Asset Links: https://wiper-finder.com/.well-known/assetlinks.json

## 사전 준비

### 1. Android Studio 설치 ✅

### 2. Bubblewrap + 환경 확인 (터미널)

```bash
npm install -g @bubblewrap/cli
cd ~/Projects/wiper-finder
source scripts/twa-env.sh
bubblewrap doctor
```

**`JDK 설치?` 질문이 나오면:**
- **Y** → Bubblewrap이 JDK 17 설치 (추천, Android Studio JDK 25와 별개)
- **n** → Android Studio JDK 경로 입력:
  `/Applications/Android Studio.app/Contents/jbr/Contents/Home`

doctor가 전부 ✅ 나오면 OK.

## 1. manifest 배포 ✅

```bash
node scripts/build.mjs
wrangler pages deploy dist --project-name=wiper-finder
```

확인: https://wiper-finder.com/manifest.json

## 2. Bubblewrap 초기화 (최초 1회)

```bash
node scripts/build-twa.mjs --init
```

- 패키지 ID: `com.wiperfinder.app` (기본값 확인)
- 서명 키: 새로 생성 (비밀번호 **기록해 두세요** — 업데이트마다 필요)
- 생성 파일: `twa/twa-manifest.json`, `twa/android.keystore`

## 3. assetlinks.json 갱신

```bash
node scripts/update-assetlinks.mjs --from-twa
```

## 4. assetlinks 배포

```bash
node scripts/build.mjs
wrangler pages deploy dist --project-name=wiper-finder
```

확인: https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://wiper-finder.com&relation=delegate_permission/common.handle_all_urls

## 5. AAB 빌드

```bash
node scripts/build-twa.mjs
```

출력: `twa/app/build/outputs/bundle/release/app-release.aab`

## 6. Play Console 업로드

Play Console → 앱 → 테스트 → 내부 테스트 → 새 버전 만들기 → AAB 업로드

## 아이콘 재생성

```bash
node scripts/generate-icons.mjs
```
