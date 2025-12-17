// components/OrderSkeleton.js
import { View, StyleSheet, ScrollView } from 'react-native';
import Skeleton from './Skeleton';
import DESIGN from '../../theme';

// Single Order Card Skeleton
const OrderCardSkeleton = () => {
    return (
        <View style={styles.card}>
            {/* Dealer Name */}
            <Skeleton
                width="70%"
                height={20}
                borderRadius={4}
            />

            {/* Owner Name */}
            <Skeleton
                width="50%"
                height={20}
                borderRadius={4}
                style={{ marginTop: DESIGN.spacing.sm }}
            />

            {/* Bottom Row - Amount and Status */}
            <View style={styles.bottomRow}>
                {/* Amount */}
                <Skeleton width={80} height={20} borderRadius={4} />

                {/* Status Badge */}
                <Skeleton width={90} height={28} borderRadius={DESIGN.borderRadius.sm} />
            </View>
        </View>
    );
};

export default function OrderSkeleton({ count = 5 }) {
    return (
        <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
            {Array.from({ length: count }).map((_, index) => (
                <OrderCardSkeleton key={`order-skeleton-${index}`} />
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: DESIGN.spacing.md,
    },
    card: {
        backgroundColor: DESIGN.colors.surface,
        borderRadius: DESIGN.borderRadius.sm,
        padding: DESIGN.spacing.md,
        marginBottom: DESIGN.spacing.md,
        ...DESIGN.shadows.medium,
    },
    dateContainer: {
        position: 'absolute',
        top: DESIGN.spacing.sm,
        right: DESIGN.spacing.md,
        zIndex: 10,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: DESIGN.spacing.sm,
    },
});