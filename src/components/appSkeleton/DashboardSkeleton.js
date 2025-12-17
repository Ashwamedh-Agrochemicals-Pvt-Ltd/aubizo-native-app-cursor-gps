// src/components/appSkeleton/DashboardSkeleton.tsx
import { View, ScrollView } from 'react-native';
import Skeleton from './Skeleton';
import styles from '../../styles/dashboard.style';
import DESIGN from '../../theme';

export default function DashboardSkeleton() {
  return (
    <View style={styles.container}>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.mainContent}>
          <View style={styles.welcomeContainer}>
            <Skeleton width="50%" height={28} borderRadius={6} style={{ marginBottom: 8 }} />
            <Skeleton width="80%" height={28} borderRadius={8} />

          </View>
          {/* Visit Overview */}
          <View style={styles.section}>
            <View style={styles.visitTitleRow}>
              <Skeleton width={140} height={30} borderRadius={8} style={{ marginBottom: 8 }} />
            </View>
            <View style={styles.visitRow}>
              <View style={styles.visitItemContainer}>
                <Skeleton width={50} height={42} borderRadius={8} style={{ marginBottom: 8 }} />
                <Skeleton width={80} height={16} borderRadius={6} />
              </View>
              <View style={styles.visitDivider} />
              <View style={styles.visitItemContainer}>
                <Skeleton width={50} height={42} borderRadius={8} style={{ marginBottom: 8 }} />
                <Skeleton width={70} height={16} borderRadius={6} />
              </View>
              <View style={styles.visitDivider} />
              <View style={styles.visitItemContainer}>
                <Skeleton width={50} height={42} borderRadius={8} style={{ marginBottom: 8 }} />
                <Skeleton width={70} height={16} borderRadius={6} />
              </View>
            </View>
          </View>

          {/* Action Cards */}
          <View style={styles.actionsGrid}>
            <View style={[styles.actionCard, { borderColor: DESIGN.colors.border }]}>
              <Skeleton width={56} height={56} style={{ marginBottom: 12 }} />
              <Skeleton width={110} height={30} borderRadius={6} />
            </View>
            <View style={[styles.actionCard, { borderColor: DESIGN.colors.border }]}>
              <Skeleton width={56} height={56} style={{ marginBottom: 12 }} />
              <Skeleton width={110} height={30} borderRadius={6} />
            </View>
          </View>

          {/* Punch Activity */}
          <View style={{ marginHorizontal: DESIGN.spacing.sm }}>
            <View style={styles.activityHeader}>
              <Skeleton width={140} height={30} borderRadius={8} />
            </View>

            {/* Punch In */}
            <View style={styles.punchSection}>
              <View style={styles.punchSectionRow}>
                <Skeleton width={40} height={40} borderRadius={12} />
                <Skeleton width={90} height={20} borderRadius={6} style={{ marginLeft: 12 }} />
              </View>
              <Skeleton width={100} height={22} borderRadius={6} />
            </View>
            <View style={styles.punchSection}>
              <View style={styles.punchSectionRow}>
                <Skeleton width={40} height={40} borderRadius={12} />
                <Skeleton width={90} height={20} borderRadius={6} style={{ marginLeft: 12 }} />
              </View>
              <Skeleton width={100} height={22} borderRadius={6} />
            </View>

          </View>
        </View>
      </ScrollView>
    </View>
  );
}