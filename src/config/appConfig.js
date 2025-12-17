import Constants from 'expo-constants';

export function getBrandConfig() {
    const extra =
        Constants.expoConfig?.extra ??
        Constants.manifest?.extra ??
        {};

    const APP_BRAND = extra.APP_BRAND ?? 'aubizo';

    return {
        brand: APP_BRAND,
        brandName:
            APP_BRAND === 'ashwamedh'
                ? 'Ashwamedh'
                : 'Aubizo',
    };
}
