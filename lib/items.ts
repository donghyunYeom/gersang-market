// 용병 제작에 필요한 아이템 목록 정의 (전설장수 + 각성장수)

export interface ItemRequirement {
  name: string;
  quantity: number;
}

export interface ChildMercenary {
  id: number;
  name: string;
  imgPath: string;
  attributesName: string;
  countryName: string;
  items: ItemRequirement[];
  classTypeName: string;
}

export interface Mercenary {
  id: number;
  name: string;
  imgPath: string;
  attributesName: string;
  countryName: string;
  items: ItemRequirement[];
  classTypeName: string;
  childMercenaries: ChildMercenary[];
}

// craftingMaterials 문자열 파싱 함수
function parseCraftingMaterials(materialsStr: string): ItemRequirement[] {
  if (!materialsStr) return [];

  return materialsStr.split(', ').map(item => {
    const match = item.match(/(.+?)\s+(\d+)개/);
    if (match) {
      return { name: match[1], quantity: parseInt(match[2]) };
    }
    return { name: item, quantity: 1 };
  });
}

// 개조장수 데이터 (재료는 육의전에서 구매 불가 - 개수만 표시)
const MODIFIED_MERCENARIES: Record<number, ChildMercenary> = {
  134: {
    id: 134,
    name: '개량된 흑룡차',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_66.png',
    attributesName: '水',
    countryName: '일본',
    items: [{ name: '변이된 용의 보주', quantity: 20 }],
    classTypeName: '개조장수',
  },
  133: {
    id: 133,
    name: '개량된 지진차',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_2_293.png',
    attributesName: '火',
    countryName: '일본',
    items: [{ name: '연발 총신', quantity: 20 }],
    classTypeName: '개조장수',
  },
  129: {
    id: 129,
    name: '개량된 발석거',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_67.png',
    attributesName: '水',
    countryName: '중국',
    items: [{ name: '봉인부적', quantity: 20 }],
    classTypeName: '개조장수',
  },
  128: {
    id: 128,
    name: '개량된 불랑기포',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_2_295.png',
    attributesName: '火',
    countryName: '중국',
    items: [{ name: '노획한 포탄', quantity: 20 }],
    classTypeName: '개조장수',
  },
  124: {
    id: 124,
    name: '개량된 봉황비조',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_46.png',
    attributesName: '火',
    countryName: '대만',
    items: [{ name: '불타는깃털', quantity: 20 }],
    classTypeName: '개조장수',
  },
  123: {
    id: 123,
    name: '개량된 화룡차',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_2_294.png',
    attributesName: '火',
    countryName: '대만',
    items: [{ name: '거대 화룡의 머리뼈', quantity: 20 }],
    classTypeName: '개조장수',
  },
  119: {
    id: 119,
    name: '개량된 뇌전차',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_45.png',
    attributesName: '雷',
    countryName: '조선',
    items: [{ name: '진은조각', quantity: 20 }],
    classTypeName: '개조장수',
  },
  118: {
    id: 118,
    name: '개량된 거북차',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_2_292.png',
    attributesName: '火',
    countryName: '조선',
    items: [{ name: '신기전의화살', quantity: 20 }],
    classTypeName: '개조장수',
  },
};

// 각성장수 데이터
const AWAKENED_MERCENARIES: Record<number, ChildMercenary> = {
  146: {
    id: 146,
    name: '각성 라시야',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_282.png',
    attributesName: '水',
    countryName: '인도',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  145: {
    id: 145,
    name: '각성 쿠베라마차',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_266.png',
    attributesName: '水',
    countryName: '인도',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  144: {
    id: 144,
    name: '각성 하누만',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_264.png',
    attributesName: '風',
    countryName: '인도',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  143: {
    id: 143,
    name: '각성 난다데비',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_252.png',
    attributesName: '風',
    countryName: '인도',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  142: {
    id: 142,
    name: '각성 슈크라',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_224.png',
    attributesName: '火',
    countryName: '인도',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  141: {
    id: 141,
    name: '각성 나라야나',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_192.png',
    attributesName: '火',
    countryName: '인도',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  140: {
    id: 140,
    name: '각성 아르주나',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_174.png',
    attributesName: '風',
    countryName: '인도',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  139: {
    id: 139,
    name: '각성 파쇄차',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_122.png',
    attributesName: '風',
    countryName: '인도',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  138: {
    id: 138,
    name: '각성 구흐야카',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_101.png',
    attributesName: '雷',
    countryName: '인도',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  137: {
    id: 137,
    name: '각성 아즈미',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_151.png',
    attributesName: '雷',
    countryName: '일본',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  136: {
    id: 136,
    name: '각성 세쓰노카미',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_107.png',
    attributesName: '火',
    countryName: '일본',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  135: {
    id: 135,
    name: '각성 도라노스케',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_74.png',
    attributesName: '風',
    countryName: '일본',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  132: {
    id: 132,
    name: '각성 가네샤',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_165.png',
    attributesName: '水',
    countryName: '중국',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  131: {
    id: 131,
    name: '각성 동방은아',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_93.png',
    attributesName: '水',
    countryName: '중국',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  130: {
    id: 130,
    name: '각성 오행기',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_73.png',
    attributesName: '火',
    countryName: '중국',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  127: {
    id: 127,
    name: '각성 뇌공',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_147.png',
    attributesName: '雷',
    countryName: '대만',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  126: {
    id: 126,
    name: '각성 유민',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_77.png',
    attributesName: '風',
    countryName: '대만',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  125: {
    id: 125,
    name: '각성 크라슈미',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_72.png',
    attributesName: '風',
    countryName: '대만',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  122: {
    id: 122,
    name: '각성 선무공신',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_4_157.png',
    attributesName: '火',
    countryName: '조선',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  121: {
    id: 121,
    name: '각성 서산대사',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_76.png',
    attributesName: '雷',
    countryName: '조선',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
  120: {
    id: 120,
    name: '각성 시호충장',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_71.png',
    attributesName: '雷',
    countryName: '조선',
    items: parseCraftingMaterials('영웅의 영혼석 20개, 각성석 1개'),
    classTypeName: '각성장수',
  },
};

// 전설장수와 필요한 각성장수 ID 매핑
const LEGEND_TO_AWAKENED: Record<number, number[]> = {
  206: [140, 138, 145, 142], // 레지나 술타나
  160: [127, 126, 122, 146], // 선인 만선야
  159: [131, 139, 136, 137], // 모치즈키 치요메
  158: [130, 132, 127, 144], // 봉선 여포
  157: [122, 140, 120],      // 도사 홍길동
  156: [144, 146, 142, 143], // 악바르 대제
  155: [137, 125],           // 해신 마조
  154: [135, 136, 126],      // 검성 보쿠텐
  153: [132, 131, 120],      // 여걸 화목란
  152: [121],                // 도령 최무선
  151: [138, 145, 141, 139], // 재상 바지라오
  150: [130],                // 군신 노부츠나
  149: [121],                // 야왕 맹획
  148: [125],                // 무희 초선
  147: [135],                // 신궁 주몽
};

// 전설장수와 필요한 개조장수 ID 매핑
const LEGEND_TO_MODIFIED: Record<number, number[]> = {
  157: [134],           // 도사 홍길동 → 개량된 흑룡차
  155: [123, 124],      // 해신 마조 → 개량된 화룡차, 봉황비조
  154: [133],           // 검성 보쿠텐 → 개량된 지진차
  153: [129],           // 여걸 화목란 → 개량된 발석거
  152: [128, 119, 118], // 도령 최무선 → 불랑기포, 뇌전차, 거북차
  150: [124, 119],      // 군신 노부츠나 → 봉황비조, 뇌전차
  149: [134, 129],      // 야왕 맹획 → 흑룡차, 발석거
  148: [133, 118],      // 무희 초선 → 지진차, 거북차
  147: [128, 123],      // 신궁 주몽 → 불랑기포, 화룡차
};

// 전설장수 데이터
export const MERCENARIES: Mercenary[] = [
  {
    id: 206,
    name: '레지나 술타나',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_4_286.png',
    attributesName: '地',
    countryName: '인도',
    items: parseCraftingMaterials('땅의속성석 30개, 정기의구슬(地) 20개, 땅의정령석 30개, 영웅의 영혼석 150개, 영혼이 봉인된 호리병 4개'),
    classTypeName: '전설장수',
    childMercenaries: [140, 138, 145, 142].map(id => AWAKENED_MERCENARIES[id]).filter(Boolean),
  },
  {
    id: 160,
    name: '선인 만선야',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_4_259.png',
    attributesName: '雷',
    countryName: '대만',
    items: parseCraftingMaterials('뇌전의속성석 40개, 정기의구슬(雷) 25개, 뇌전의정령석 40개, 영웅의 영혼석 150개, 영혼이 봉인된 호리병 4개'),
    classTypeName: '전설장수',
    childMercenaries: [127, 126, 122, 146].map(id => AWAKENED_MERCENARIES[id]).filter(Boolean),
  },
  {
    id: 159,
    name: '모치즈키 치요메',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_4_240.png',
    attributesName: '水',
    countryName: '일본',
    items: parseCraftingMaterials('물의속성석 40개, 정기의구슬(水) 25개, 물의정령석 40개, 영웅의 영혼석 150개, 영혼이 봉인된 호리병 4개'),
    classTypeName: '전설장수',
    childMercenaries: [131, 139, 136, 137].map(id => AWAKENED_MERCENARIES[id]).filter(Boolean),
  },
  {
    id: 158,
    name: '봉선 여포',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_4_235.png',
    attributesName: '火',
    countryName: '중국',
    items: parseCraftingMaterials('불의속성석 40개, 정기의구슬(火) 25개, 불의정령석 40개, 영웅의 영혼석 150개, 영혼이 봉인된 호리병 4개'),
    classTypeName: '전설장수',
    childMercenaries: [130, 132, 127, 144].map(id => AWAKENED_MERCENARIES[id]).filter(Boolean),
  },
  {
    id: 157,
    name: '도사 홍길동',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_4_176.png',
    attributesName: '風',
    countryName: '조선',
    items: parseCraftingMaterials('바람의속성석 40개, 정기의구슬(風) 25개, 바람의정령석 40개, 영웅의 영혼석 150개, 영혼이 봉인된 호리병 4개'),
    classTypeName: '전설장수',
    childMercenaries: [
      ...[122, 140, 120].map(id => AWAKENED_MERCENARIES[id]).filter(Boolean),
      ...[134].map(id => MODIFIED_MERCENARIES[id]).filter(Boolean),
    ],
  },
  {
    id: 156,
    name: '악바르 대제',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_4_130.png',
    attributesName: '地',
    countryName: '인도',
    items: parseCraftingMaterials('땅의속성석 30개, 정기의구슬(地) 20개, 땅의정령석 20개, 영웅의 영혼석 150개, 영혼이 봉인된 호리병 4개'),
    classTypeName: '전설장수',
    childMercenaries: [144, 146, 142, 143].map(id => AWAKENED_MERCENARIES[id]).filter(Boolean),
  },
  {
    id: 155,
    name: '해신 마조',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_4_82.png',
    attributesName: '水',
    countryName: '대만',
    items: parseCraftingMaterials('물의속성석 40개, 정기의구슬(水) 25개, 물의정령석 40개, 영웅의 영혼석 150개, 영혼이 봉인된 호리병 4개'),
    classTypeName: '전설장수',
    childMercenaries: [
      ...[137, 125].map(id => AWAKENED_MERCENARIES[id]).filter(Boolean),
      ...[123, 124].map(id => MODIFIED_MERCENARIES[id]).filter(Boolean),
    ],
  },
  {
    id: 154,
    name: '검성 보쿠텐',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_4_81.png',
    attributesName: '風',
    countryName: '일본',
    items: parseCraftingMaterials('바람의속성석 40개, 정기의구슬(風) 25개, 바람의정령석 40개, 영웅의 영혼석 150개, 영혼이 봉인된 호리병 4개'),
    classTypeName: '전설장수',
    childMercenaries: [
      ...[135, 136, 126].map(id => AWAKENED_MERCENARIES[id]).filter(Boolean),
      ...[133].map(id => MODIFIED_MERCENARIES[id]).filter(Boolean),
    ],
  },
  {
    id: 153,
    name: '여걸 화목란',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_4_56.png',
    attributesName: '雷',
    countryName: '중국',
    items: parseCraftingMaterials('뇌전의속성석 40개, 정기의구슬(雷) 25개, 뇌전의정령석 40개, 영웅의 영혼석 150개, 영혼이 봉인된 호리병 4개'),
    classTypeName: '전설장수',
    childMercenaries: [
      ...[132, 131, 120].map(id => AWAKENED_MERCENARIES[id]).filter(Boolean),
      ...[129].map(id => MODIFIED_MERCENARIES[id]).filter(Boolean),
    ],
  },
  {
    id: 152,
    name: '도령 최무선',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_4_55.png',
    attributesName: '火',
    countryName: '조선',
    items: parseCraftingMaterials('불의속성석 40개, 정기의구슬(火) 25개, 불의정령석 40개, 영웅의 영혼석 150개, 영혼이 봉인된 호리병 4개'),
    classTypeName: '전설장수',
    childMercenaries: [
      ...[121].map(id => AWAKENED_MERCENARIES[id]).filter(Boolean),
      ...[128, 119, 118].map(id => MODIFIED_MERCENARIES[id]).filter(Boolean),
    ],
  },
  {
    id: 151,
    name: '재상 바지라오',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_4_39.png',
    attributesName: '地',
    countryName: '인도',
    items: parseCraftingMaterials('땅의속성석 15개, 정기의구슬(地) 15개, 땅의정령석 15개, 영웅의 영혼석 100개, 영혼이 봉인된 호리병 4개'),
    classTypeName: '전설장수',
    childMercenaries: [138, 145, 141, 139].map(id => AWAKENED_MERCENARIES[id]).filter(Boolean),
  },
  {
    id: 150,
    name: '군신 노부츠나',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_263.png',
    attributesName: '火',
    countryName: '일본',
    items: parseCraftingMaterials('불의속성석 20개, 정기의구슬(火) 20개, 불의정령석 20개, 영웅의 영혼석 100개, 영혼이 봉인된 호리병 4개'),
    classTypeName: '전설장수',
    childMercenaries: [
      ...[130].map(id => AWAKENED_MERCENARIES[id]).filter(Boolean),
      ...[124, 119].map(id => MODIFIED_MERCENARIES[id]).filter(Boolean),
    ],
  },
  {
    id: 149,
    name: '야왕 맹획',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_251.png',
    attributesName: '風',
    countryName: '대만',
    items: parseCraftingMaterials('바람의속성석 20개, 바람의정령석 20개, 정기의구슬(風) 20개, 영웅의 영혼석 100개, 영혼이 봉인된 호리병 4개'),
    classTypeName: '전설장수',
    childMercenaries: [
      ...[121].map(id => AWAKENED_MERCENARIES[id]).filter(Boolean),
      ...[134, 129].map(id => MODIFIED_MERCENARIES[id]).filter(Boolean),
    ],
  },
  {
    id: 148,
    name: '무희 초선',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_201.png',
    attributesName: '水',
    countryName: '중국',
    items: parseCraftingMaterials('물의속성석 20개, 정기의구슬(水) 20개, 물의정령석 20개, 영웅의 영혼석 100개, 영혼이 봉인된 호리병 4개'),
    classTypeName: '전설장수',
    childMercenaries: [
      ...[125].map(id => AWAKENED_MERCENARIES[id]).filter(Boolean),
      ...[133, 118].map(id => MODIFIED_MERCENARIES[id]).filter(Boolean),
    ],
  },
  {
    id: 147,
    name: '신궁 주몽',
    imgPath: 'https://cdn.jsdelivr.net/gh/gh777kkk/gersanginfo-img@main/characters/PORTRAIT_INVEN_3_200.png',
    attributesName: '雷',
    countryName: '조선',
    items: parseCraftingMaterials('뇌전의속성석 20개, 정기의구슬(雷) 20개, 뇌전의정령석 20개, 영웅의 영혼석 100개, 영혼이 봉인된 호리병 4개'),
    classTypeName: '전설장수',
    childMercenaries: [
      ...[135].map(id => AWAKENED_MERCENARIES[id]).filter(Boolean),
      ...[128, 123].map(id => MODIFIED_MERCENARIES[id]).filter(Boolean),
    ],
  },
];

// 개조장수 재료 목록 (육의전에서 구매 불가 - 가격 조회 제외)
const MODIFIED_MERCENARY_ITEMS = new Set([
  '변이된 용의 보주',
  '연발 총신',
  '봉인부적',
  '노획한 포탄',
  '불타는깃털',
  '거대 화룡의 머리뼈',
  '진은조각',
  '신기전의화살',
]);

// 모든 고유 아이템 목록 추출 (개조장수 재료 제외)
export function getAllUniqueItems(): string[] {
  const itemSet = new Set<string>();

  // 전설장수 재료
  MERCENARIES.forEach(merc => {
    merc.items.forEach(item => {
      itemSet.add(item.name);
    });
    // 하위 용병 재료 (각성장수만 - 개조장수 재료는 제외)
    merc.childMercenaries.forEach(child => {
      if (child.classTypeName !== '개조장수') {
        child.items.forEach(item => {
          itemSet.add(item.name);
        });
      }
    });
  });

  return Array.from(itemSet);
}

// 개조장수 재료인지 확인
export function isModifiedMercenaryItem(itemName: string): boolean {
  return MODIFIED_MERCENARY_ITEMS.has(itemName);
}

// 전설장수의 전체 재료 비용 계산 (하위 용병 포함)
export function calculateTotalCost(
  mercenary: Mercenary,
  prices: Record<string, PriceInfo>
): { mainCost: number; childCost: number; totalCost: number } {
  // 메인 재료 비용
  const mainCost = mercenary.items.reduce((sum, item) => {
    const priceInfo = prices[item.name];
    if (priceInfo && priceInfo.minPrice > 0) {
      return sum + priceInfo.minPrice * item.quantity;
    }
    return sum;
  }, 0);

  // 하위 용병 재료 비용
  const childCost = mercenary.childMercenaries.reduce((sum, child) => {
    return sum + child.items.reduce((childSum, item) => {
      const priceInfo = prices[item.name];
      if (priceInfo && priceInfo.minPrice > 0) {
        return childSum + priceInfo.minPrice * item.quantity;
      }
      return childSum;
    }, 0);
  }, 0);

  return {
    mainCost,
    childCost,
    totalCost: mainCost + childCost,
  };
}

// 가격 정보 타입
export interface PriceInfo {
  itemName: string;
  minPrice: number;
  maxPrice: number;
  avgPrice: number;
  quantity: number;
  listings: PriceListing[];
  lastUpdated: string;
}

export interface PriceListing {
  price: number;
  quantity: number;
  sellerName: string;
}

// 숫자 포맷팅 (콤마 형식 + 원)
export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

// 간단한 숫자 포맷팅
export function formatNumber(num: number): string {
  return num.toLocaleString('ko-KR');
}

// 속성별 색상
export function getAttributeColor(attr: string): string {
  switch (attr) {
    case '火': return '#ef4444'; // 빨강
    case '水': return '#3b82f6'; // 파랑
    case '風': return '#22c55e'; // 초록
    case '雷': return '#eab308'; // 노랑
    case '地': return '#a855f7'; // 보라
    default: return '#737373';
  }
}
