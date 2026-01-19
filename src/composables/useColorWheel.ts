import { computed, ref, type Ref } from 'vue';
import { getHue, hueDifference } from '@/lib/colorUtils';
import type { FilamentCard } from './useFilaments';
import { useColorHarmonies } from './useColorHarmonies';

export type HarmonyFilter = 'all' | 'complementary' | 'analogous' | 'triadic' | 'split' | 'similar';

export function useColorWheel(
  filament: Ref<FilamentCard | null>,
  allFilaments: Ref<FilamentCard[]>
) {
  const activeFilter = ref<HarmonyFilter>('all');

  const {
    similarColors,
    complementaryColors,
    analogousColors,
    splitComplementaryColors,
    triadColors,
    isComplementary,
    isSimilar,
    isAnalogous,
    isSplitComplementary,
    isTriadic,
  } = useColorHarmonies(filament, allFilaments);

  const toggleFilter = (type: HarmonyFilter) => {
    activeFilter.value = activeFilter.value === type ? 'all' : type;
  };

  const shouldShowSegment = (item: FilamentCard): boolean => {
    if (activeFilter.value === 'all' || item.id === filament.value?.id) return true;

    switch (activeFilter.value) {
      case 'complementary': return isComplementary(item);
      case 'analogous': return isAnalogous(item);
      case 'triadic': return isTriadic(item);
      case 'split': return isSplitComplementary(item);
      case 'similar': return isSimilar(item);
      default: return true;
    }
  };

  const colorWheelItems = computed((): FilamentCard[] => {
    if (!filament.value) return [];

    const wheelColors: FilamentCard[] = [];
    const hueStep = 15; // 360 / 24 = 15 degrees per segment

    for (let targetHue = 0; targetHue < 360; targetHue += hueStep) {
      const closest = allFilaments.value
        .map(f => ({
          filament: f,
          hueDiff: hueDifference(getHue(f.colorHex), targetHue),
        }))
        .sort((a, b) => a.hueDiff - b.hueDiff)[0];

      if (closest && closest.hueDiff < 30) {
        wheelColors.push(closest.filament);
      }
    }

    return wheelColors.sort((a, b) => getHue(a.colorHex) - getHue(b.colorHex));
  });

  const getColorPosition = (item: FilamentCard | null): { x: number; y: number } => {
    if (!item) return { x: 100, y: 100 };
    const hue = getHue(item.colorHex);
    const angle = ((hue - 90) * Math.PI) / 180;
    const radius = 67.5;
    return {
      x: 100 + radius * Math.cos(angle),
      y: 100 + radius * Math.sin(angle),
    };
  };

  const getArcPath = (index: number, total: number): string => {
    const centerX = 100;
    const centerY = 100;
    const innerRadius = 40;
    const outerRadius = 90;
    const angleStart = (index / total) * 360;
    const angleEnd = ((index + 1) / total) * 360;

    const startAngleRad = ((angleStart - 90) * Math.PI) / 180;
    const endAngleRad = ((angleEnd - 90) * Math.PI) / 180;

    const x1 = centerX + innerRadius * Math.cos(startAngleRad);
    const y1 = centerY + innerRadius * Math.sin(startAngleRad);
    const x2 = centerX + outerRadius * Math.cos(startAngleRad);
    const y2 = centerY + outerRadius * Math.sin(startAngleRad);
    const x3 = centerX + outerRadius * Math.cos(endAngleRad);
    const y3 = centerY + outerRadius * Math.sin(endAngleRad);
    const x4 = centerX + innerRadius * Math.cos(endAngleRad);
    const y4 = centerY + innerRadius * Math.sin(endAngleRad);

    const largeArc = angleEnd - angleStart > 180 ? 1 : 0;

    return `M ${x1} ${y1} L ${x2} ${y2} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x1} ${y1} Z`;
  };

  const getOuterRingPath = (index: number, total: number): string => {
    const centerX = 100;
    const centerY = 100;
    const ringRadius = 94;
    const angleStart = (index / total) * 360;
    const angleEnd = ((index + 1) / total) * 360;

    const startAngleRad = ((angleStart - 90) * Math.PI) / 180;
    const endAngleRad = ((angleEnd - 90) * Math.PI) / 180;

    const x1 = centerX + ringRadius * Math.cos(startAngleRad);
    const y1 = centerY + ringRadius * Math.sin(startAngleRad);
    const x2 = centerX + ringRadius * Math.cos(endAngleRad);
    const y2 = centerY + ringRadius * Math.sin(endAngleRad);

    const largeArc = angleEnd - angleStart > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${ringRadius} ${ringRadius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const getTrianglePoints = (): string => {
    if (triadColors.value.length !== 3) return '';
    return triadColors.value
      .map(c => {
        const pos = getColorPosition(c);
        return `${pos.x},${pos.y}`;
      })
      .join(' ');
  };

  return {
    activeFilter,
    toggleFilter,
    shouldShowSegment,
    colorWheelItems,
    similarColors,
    complementaryColors,
    analogousColors,
    splitComplementaryColors,
    triadColors,
    isComplementary,
    isSimilar,
    isAnalogous,
    isSplitComplementary,
    isTriadic,
    getColorPosition,
    getArcPath,
    getOuterRingPath,
    getTrianglePoints,
  };
}
