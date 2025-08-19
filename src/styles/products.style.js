import { StyleSheet } from 'react-native';
import DESIGN from '../theme';
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DESIGN.colors.background,
  },
  listContainer: {
    paddingHorizontal: DESIGN.spacing.lg,
    paddingBottom: DESIGN.spacing.xl,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: DESIGN.spacing.md,
  },
  cardContainer: {
    flex: 1,
    maxWidth: "48%",
  },
  productCard: {
    backgroundColor: DESIGN.colors.surface,
    borderRadius: DESIGN.borderRadius.lg,
    overflow: "hidden",
    ...DESIGN.shadows.medium,
    flex: 1,
  },
  imageContainer: {
    height: 140,
    backgroundColor: DESIGN.colors.surfaceElevated,
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productInfo: {
    padding: DESIGN.spacing.sm,
  },
  categoryText: {
    fontSize: 12,
    color: DESIGN.colors.textSecondary,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: DESIGN.colors.textPrimary,
    marginTop: 4,
  },
  headerContainer: {
    paddingVertical: DESIGN.spacing.sm,
    alignItems: "center",
  },
  headerTitle: {
    ...DESIGN.typography.hero,
    color: DESIGN.colors.textPrimary,
  },
  headerSubtitle: {
    ...DESIGN.typography.body,
    color: DESIGN.colors.textSecondary,
    marginTop: DESIGN.spacing.sm,
    textAlign: "center",
  },
});