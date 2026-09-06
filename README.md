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

`.env`에 파트너스 API 키를 넣으면, **사이즈 조합(14종)** 별로 쿠팡 검색 결과를 가져와 결과 페이지에 가로 상품 카드를 표시합니다.

| 변수 | 설명 |
|------|------|
| `COUPANG_ACCESS_KEY` | 파트너스 Access Key |
| `COUPANG_SECRET_KEY` | 파트너스 Secret Key |
| `COUPANG_SUB_ID` | (선택) 채널 subId |

- 캐시: `data/products/{운전}-{조수}.json` (7일 유효). 검색어 예: `불스원 500 450`
- API 호출 제한 대비: 빌드당 최대 8회만 새로 조회. 14종 사이즈 전부 채우려면 빌드 2번
- 강제 갱신: `$NODE scripts/build.mjs --refresh-coupang`

`.env.example` 참고. **`.env`는 Git에 올리지 마세요.**


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
