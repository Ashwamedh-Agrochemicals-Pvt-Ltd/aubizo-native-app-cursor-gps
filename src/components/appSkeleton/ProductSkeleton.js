import { View, Dimensions, ScrollView } from 'react-native';
import Skeleton from './Skeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_MARGIN = 16;
const NUM_COLUMNS = SCREEN_WIDTH > 768 ? 3 : 2;
const CARD_WIDTH = (SCREEN_WIDTH - (NUM_COLUMNS + 1) * CARD_MARGIN) / NUM_COLUMNS;

import DESIGN from '../../theme';
// Single Product Card Skeleton
const ProductCardSkeleton = () => {
    return (
        <View
            style={{
                width: CARD_WIDTH,
                backgroundColor: DESIGN.colors.surface,
                borderRadius: 8,
                overflow: 'hidden',
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            }}
        >
            {/* Image Skeleton - 1:1 aspect ratio */}
            <View style={{ width: '100%', aspectRatio: 1 }}>
                <Skeleton width="100%" height="100%" />
            </View>

            {/* Content Skeleton */}
            <View style={{ padding: 8 }}>
                {/* Category */}
                <Skeleton width="60%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />

                {/* Title - 2 lines */}
                <Skeleton width="80%" height={18} borderRadius={4} />
            </View>
        </View>
    );
};

// Product Row Skeleton (contains NUM_COLUMNS cards)
const ProductRowSkeleton = () => {
    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginBottom: CARD_MARGIN,
                paddingHorizontal: CARD_MARGIN,
            }}
        >
            {Array.from({ length: NUM_COLUMNS }).map((_, index) => (
                <ProductCardSkeleton key={`card-${index}`} />
            ))}
        </View>
    );
};

export default function ProductSkeleton() {
    // Calculate how many rows to show based on screen height
    const numRows = Math.ceil(Dimensions.get('window').height / 250);

    return (
        <>
            {/* Product Grid Skeleton */}
            <ScrollView
                contentContainerStyle={{ paddingVertical: CARD_MARGIN }}
                showsVerticalScrollIndicator={false}
            >
                {Array.from({ length: numRows }).map((_, index) => (
                    <ProductRowSkeleton key={`row-${index}`} />
                ))}
            </ScrollView>
        </>

    );
}