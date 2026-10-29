# WiperFinder

현대·기아 자동차 와이퍼 사이즈 검색기 (정적 사이트)

## 사진 넣는 방법

1. 파일명 = `generations` 시트의 **`image`** 값 (없으면 **`id`.jpg**)
2. 저장 위치: `public/images/cars/`
3. 예: 디 올 뉴 그랜저 → `gn7.jpg`

```
public/images/cars/gn7.jpg
public/images/cars/ig-pe.jpg
```

## 빌드

```bash
# Cursor 내장 Node 사용 (macOS)
NODE="/Applications/Cursor.app/Contents/Resources/app/resources/helpers/node"

$NODE scripts/build.mjs
```

### 쿠팡 상품 자동 노출

`.env`에 파트너스 API 키를 넣으면, 빌드 시 **고유 사이즈 조합**별로 쿠팡 검색 결과를 가져와 결과 페이지에 가로 상품 카드를 표시합니다.  
방문자가 페이지를 열 때는 검색 API를 호출하지 않습니다(캐시된 HTML + 정적 제휴 링크만 사용).

| 변수 | 설명 |
|------|------|
| `COUPANG_ACCESS_KEY` | 파트너스 Access Key |
| `COUPANG_SECRET_KEY` | 파트너스 Secret Key |
| `COUPANG_SUB_ID` | (선택) 채널 subId |
| `COUPANG_MAX_SEARCH_PER_HOUR` | (선택) 시간당 검색 상한, 기본 `6` (공식 한도 10 미만) |

**공식 호출 한도 (계정 단위, 경고 3회 시 이용 제한 가능)**

| 구분 | 한도 |
|------|------|
| 검색 API | 1시간 10회 |
| 리포트 API | 1시간 50회 |
| 모든 API | 1분 100회 |
| 파트너스 웹 링크생성 | 1분 50회 |

**이 레포 가드**

- 캐시 키: `{운전mm}-{조수mm}` (예: `650-450`). 검색어: `coupang_keyword` 또는 기본 `불스원 650 450`
- 캐시 파일: `data/products/{키}.json` (7일 유효)
- 시간당 검색 API **최대 6회** (공식 10회보다 여유). 빌드당도 최대 6회
- 연속 호출 간격 1.5초. `403`/제한 응답 시 **하드스톱** (`data/coupang-rate-limit.json`)
- `--refresh-coupang`도 시간당 한도·하드스톱을 **우회하지 않음**
- 고유 조합이 6개를 넘으면 나머지는 다음 빌드/다음 시간에 이어서 채움
- 다이나믹 배너(`ads-partners` / `g.js`) 사용 안 함

```bash
# 강제 갱신(한도 내에서만). 이용 제한 중에는 실행하지 마세요.
$NODE scripts/build.mjs --refresh-coupang
```

`.env.example` 참고. **`.env`는 Git에 올리지 마세요.**  
`data/products/`, `data/coupang-rate-limit.json`도 Git에 올리지 않습니다.


결과물: `dist/` 폴더

## ChemiCloud 배포

1. `dist/` **안의 파일 전체**를 `public_html/wiper/` 에 업로드
2. 서브폴더가 아니라 루트에 올릴 경우 `.env`의 `BASE_PATH=` 비우기
3. `/wiper`에 올릴 경우 `.env` → `BASE_PATH=/wiper` 후 다시 빌드

## Cloudflare Pages 배포

1. `node scripts/build.mjs` 실행
2. 터미널에서 배포:
   ```bash
   wrangler pages deploy dist --project-name=wiper-finder
   ```
   (또는 `dist/` 내용을 zip 업로드)
3. 도메인 연결 후 `.env` → `SITE_URL=https://wiper-finder.com` 로 맞추고 재빌드 (canonical·sitemap용)

### 수정 위치 요약

| 바꾸려는 것 | 파일/위치 |
|------------|-----------|
| 차종·와이퍼 데이터 | Google Sheet → `node scripts/build.mjs` |
| 화면·SEO·공유 버튼 | `scripts/render.mjs`, `scripts/seo.mjs` |
| 차량 사진 | `public/images/cars/` + 시트 `image` 컬럼 |
| 경고등 내용 | Sheet `warning_lights` 탭 |
| 배포 | `wrangler pages deploy dist --project-name=wiper-finder` |

## SEO

| `.env` | 용도 |
|--------|------|
| `SITE_URL` | canonical, Open Graph, sitemap (기본 `https://wiper-finder.com`) |

빌드 시 `dist/sitemap.xml`, `dist/rss.xml`, `dist/robots.txt` 자동 생성.  
`robots.txt`에는 Daum 봇 허용(`User-agent: Daum`) 및 웹마스터 인증 코드가 포함됩니다.  
도메인 연결 후 Google Search Console·네이버·다음 웹마스터도구에 sitemap/RSS 제출.

## 시트 수정 후

1. Google Sheet 수정
2. `scripts/build.mjs` 다시 실행
3. `dist/` 재업로드

## Google Sheet

- 탭: `brands`, `models`, `generations`
- `generations`에 **`image`** 컬럼 (파일명), **`hybrid`** 컬럼 (1/2/3, 선택)
- 공유: 링크가 있는 사용자 **보기**

### hybrid 컬럼 (generations)

| 값 | 화면 딱지 |
|----|-----------|
| (비움) | 없음 |
| 1 | +Hybrid |
| 2 | +Electric |
| 3 | +Hybrid+Electric |

라벨에서 「하이브리드」「일렉트릭」 글자는 빼고, **`label`은 짧게** + **`hybrid` 숫자**로 표시.

## 자동 처리 (시트에 안 적어도 됨)

| 항목 | 자동 |
|------|------|
| product_title_front | `가성비 {운전}+{조수}mm 세트` |
| coupang_keyword | `불스원 {운전} {조수}` (예: `불스원 500 450`) |
| product_title_rear | `후방 전용 와이퍼` (rear 있을 때) |
| rear none | `이 차종은 후방 와이퍼가 없습니다.` |
| rear dedicated | `전용` |
| image | `{id}.jpg` fallback |
| **hybrid** | `1`→+Hybrid, `2`→+Electric, `3`→+Hybrid+Electric (비우면 딱지 없음) |

## 로컬 미리보기

```bash
cd dist && python3 -m http.server 8080
# http://localhost:8080
```
