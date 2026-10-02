/** @typedef {{ type: "p" | "h2" | "ul" | "table" | "youtube"; text?: string; items?: string[]; rows?: string[][]; videoId?: string; start?: number }} GuideBlock */

/** @typedef {{ id: string; title: string; summary: string; relatedIds: string[]; blocks: GuideBlock[] }} Guide */

export const GUIDE_HUB_TITLE = "와이퍼 가이드";
export const GUIDE_HUB_SUMMARY =
  "와이퍼 사이즈 확인 후, 소재 선택·교체·트러블 해결까지 한곳에서 확인하세요.";

/** 실제 교체 영상 — scripts/guides.mjs에서 ID만 바꾸면 됩니다 */
const REPLACEMENT_VIDEO_ID = "V3GaAwOzPa0";
const REPLACEMENT_VIDEO_START = 60;

/** @type {Guide[]} */
export const GUIDES = [
  {
    id: "silicone-vs-rubber",
    title: "실리콘 vs 고무 vs 합성고무 와이퍼, 뭐가 다를까?",
    summary: "소재별 수명·가격·장단점을 비교하고, 내 차에 맞는 선택 기준을 정리했습니다.",
    relatedIds: ["how-to-choose-wiper", "wiper-not-cleaning"],
    blocks: [
      {
        type: "p",
        text: "와이퍼는 소모품이라 교체 주기마다 비용이 반복됩니다. 같은 사이즈라도 소재에 따라 수명과 닦임성이 크게 달라집니다.",
      },
      { type: "h2", text: "소재별 한눈에 비교" },
      {
        type: "table",
        rows: [
          ["소재", "수명(참고)", "가격대", "특징"],
          ["실리콘", "1~2년", "중~고", "내구성·발수 우수, 고온·저온에 강함"],
          ["합성고무", "6~12개월", "중", "천연고무보다 낫지만 실리콘보다 짧음"],
          ["천연고무", "3~6개월", "저", "저렴하지만 열·자외선에 취약, 형태 변형 빠름"],
        ],
      },
      { type: "h2", text: "실리콘이 비싼데도 선택받는 이유" },
      {
        type: "p",
        text: "실리콘은 온도 변화에도 고무처럼 딱딱해지거나 녹아내리지 않습니다. 발수 코팅과 함께 쓰면 빗물이 잘 흘러내려 고속 주행에서도 시야가 유지되기 쉽습니다.",
      },
      {
        type: "ul",
        items: [
          "2년 기준 총비용: 저가 고무를 여러 번 사는 것보다 실리콘 1회 교체가 유리한 경우가 많습니다.",
          "합성고무라고 적혀 있어도 기본은 고무 계열 — 실리콘만큼의 내구성을 기대하기는 어렵습니다.",
          "사이즈가 맞는지 먼저 확인한 뒤 소재를 고르세요. → 홈에서 차종별 사이즈 검색",
        ],
      },
    ],
  },
  {
    id: "how-to-choose-wiper",
    title: "와이퍼 고르는 기준 5가지",
    summary: "사이즈 확인 후, 어떤 와이퍼를 살지 고민될 때 참고할 구매 체크리스트입니다.",
    relatedIds: ["silicone-vs-rubber", "wiper-replacement"],
    blocks: [
      {
        type: "p",
        text: "와이퍼 사이즈(mm)만 맞으면 장착은 됩니다. 다만 오래 쓰고 잘 닦이려면 아래 다섯 가지를 함께 보세요.",
      },
      {
        type: "ul",
        items: [
          "① 사이즈 일치 — 운전석·조수석·후방(mm)을 차종별로 정확히 확인",
          "② 소재 — 실리콘 또는 발수 코팅 실리콘(내구·닦임)",
          "③ 구조 — 무관절(프레임리스) 타입이 밀착·닦임성이 좋은 편",
          "④ 에어스포일러 — 고속에서 떨림·들뜸을 줄여주는 형태",
          "⑤ 지나치게 저렴한 제품은 피하기 — 고무 경화·클립 불량 빈번",
        ],
      },
      { type: "h2", text: "구매 순서 추천" },
      {
        type: "p",
        text: "① 내 차 와이퍼 사이즈 검색 → ② 앞 와이퍼 세트 구매 → ③ 후방 와이퍼가 있으면 전용 규격 확인 → ④ 6~12개월마다 상태 점검",
      },
    ],
  },
  {
    id: "wiper-noise-fix",
    title: "와이퍼에서 소리 날 때 원인과 해결 방법",
    summary: "끼익·딱딱 소리가 날 때 점검할 항목과 바로 시도할 수 있는 해결법입니다.",
    relatedIds: ["wiper-not-cleaning", "wiper-replacement"],
    blocks: [
      {
        type: "p",
        text: "와이퍼 소리는 대부분 고무 상태, 유리 오염, 밀착 불량 중 하나입니다. 교체 전에 아래를 순서대로 확인해 보세요.",
      },
      { type: "h2", text: "흔한 원인" },
      {
        type: "ul",
        items: [
          "고무 경화·균열 — 사용 기간이 길거나 햇볕에 오래 노출",
          "유리에 오일·코팅제·먼지 — 닦을 때 미끄러지며 소리 발생",
          "와이퍼 각도·클립 풀림 — 팔이 유리에 제대로 밀착하지 않음",
          "뒷유리·앞유리 곡률과 맞지 않는 규격·타입",
        ],
      },
      { type: "h2", text: "해결 방법" },
      {
        type: "ul",
        items: [
          "유리를 중성세제로 닦고 말린 뒤 재시험",
          "와이퍼 고무를 마른 수건으로 닦아 이물질 제거",
          "클립·어댑터가 단단히 체결됐는지 확인",
          "고무가 딱딱하거나 갈라졌다면 교체가 정답",
        ],
      },
    ],
  },
  {
    id: "wiper-not-cleaning",
    title: "와이퍼가 잘 안 닦일 때 — 원인 5가지와 해결",
    summary: "줄이 남거나 한쪽만 닦일 때, 원인별로 점검·조치하는 방법입니다.",
    relatedIds: ["wiper-noise-fix", "silicone-vs-rubber"],
    blocks: [
      { type: "h2", text: "증상별 원인" },
      {
        type: "ul",
        items: [
          "줄(streak)이 남음 — 고무 마모, 유리 기름때, 와이퍼 팔 변형",
          "가운데만·끝만 안 닦임 — 무관절 타입 밀착 불량 또는 사이즈 불일치",
          "후방만 약함 — 후방 전용 규격 미사용 또는 별도 교체 필요",
          "비 올 때만 안 보임 — 발수 코팅 소진, 고무 경화",
          "교체 직후부터 안 됨 — 규격 오류 또는 클립 잘못 장착",
        ],
      },
      { type: "h2", text: "해결 순서" },
      {
        type: "ul",
        items: [
          "차종별 와이퍼 사이즈를 다시 확인",
          "유리 클리너로 기름때 제거",
          "6개월 이상 사용했다면 교체 검토",
          "여전히 문제면 무관절 실리콘 타입으로 변경 검토",
        ],
      },
    ],
  },
  {
    id: "wiper-replacement",
    title: "와이퍼 교체 방법 (초보자용)",
    summary: "클립 분리부터 새 와이퍼 장착까지, 집에서 할 수 있는 교체 순서와 영상 가이드입니다.",
    relatedIds: ["how-to-choose-wiper", "wiper-noise-fix"],
    blocks: [
      {
        type: "p",
        text: "차종마다 클립 모양은 다르지만, 기본 순서는 같습니다. 교체 전 와이퍼를 세워 두면 유리에 닿지 않아 안전합니다.",
      },
      { type: "h2", text: "교체 순서" },
      {
        type: "ul",
        items: [
          "① 와이퍼를 세운 상태(수직)로 올리기 — 요즘 차량은 레버로 고정",
          "② 클립·어댑터 버튼을 눌러 기존 와이퍼 분리",
          "③ 새 와이퍼를 같은 방향으로 끼우고 '딸깍' 소리 확인",
          "④ 유리에 내려 테스트 — 떨림·소리·줄 확인",
          "⑤ 후방 와이퍼도 별도 규격이면 동일하게 교체",
        ],
      },
      { type: "h2", text: "영상으로 보기" },
      {
        type: "youtube",
        videoId: REPLACEMENT_VIDEO_ID,
        start: REPLACEMENT_VIDEO_START,
      },
      {
        type: "p",
        text: "※ 클립 타입(U·J·핀 등)은 차종별로 다릅니다. 구매 전 내 차 클립 타입을 확인하세요.",
      },
    ],
  },
];

export function getGuide(id) {
  return GUIDES.find((g) => g.id === id) ?? null;
}

export function guidePath(id) {
  return `/guide/${id}/`;
}

/** 결과 페이지 하단 고정 링크 (4개) */
export const RESULT_RELATED_GUIDE_IDS = [
  "how-to-choose-wiper",
  "silicone-vs-rubber",
  "wiper-noise-fix",
  "wiper-replacement",
];

export function buildResultFaq({ brand, model, gen, base }) {
  let rearAnswer;
  if (gen.rear_type === "none") {
    rearAnswer = "후방 와이퍼는 없습니다.";
  } else if (gen.rear_type === "dedicated") {
    rearAnswer = "후방은 전용 와이퍼를 사용합니다.";
  } else {
    rearAnswer = `후방 와이퍼 사이즈는 ${gen.rear_mm}mm입니다.`;
  }

  const vehicle = gen.label.includes(brand.name) ? gen.label : `${brand.name} ${gen.label}`;

  return [
    {
      q: `${gen.label} 와이퍼 사이즈는 얼마인가요?`,
      a: `${vehicle}(${gen.years})의 와이퍼 사이즈는 운전석 ${gen.driver_mm}mm, 조수석 ${gen.passenger_mm}mm입니다. ${rearAnswer}`,
    },
    {
      q: `${gen.label}에 실리콘 와이퍼를 써도 되나요?`,
      a: `사이즈(${gen.driver_mm}mm / ${gen.passenger_mm}mm)만 맞으면 실리콘·고무 모두 사용 가능합니다. 수명과 닦임성은 실리콘이 유리한 편입니다.`,
      guideId: "silicone-vs-rubber",
    },
    {
      q: "와이퍼는 얼마나 자주 교체해야 하나요?",
      a: "일반적으로 6~12개월, 또는 닦임이 나빠지고 고무가 갈라지면 교체하세요. 주행·주차 환경에 따라 달라집니다.",
      guideId: "how-to-choose-wiper",
    },
    {
      q: "와이퍼에서 소리가 나거나 잘 안 닦이면?",
      a: "유리 오염·고무 경화·장착 불량을 먼저 점검하세요. 상태가 나쁘면 교체가 가장 확실합니다.",
      guideId: "wiper-noise-fix",
    },
  ];
}
