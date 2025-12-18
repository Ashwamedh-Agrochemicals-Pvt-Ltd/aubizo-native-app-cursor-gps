import Constants from 'expo-constants';

export const BRAND_ASSETS = {
    ashwamedh: {
        logo: require('../../assets/ashwamedh/images/AshwamedhLogo.png'),
    },
    aubizo: {
        logo: require('../../assets/aubizo/images/adaptive-icon.png'),
    },
};

export function getBrandConfig() {
    const extra =
        Constants.expoConfig?.extra ??
        Constants.manifest?.extra ??
        {};

    const brandKey = (extra.APP_BRAND || 'aubizo').toLowerCase();

    return {
        brand: brandKey,
        brandName: brandKey === 'ashwamedh' ? 'Ashwamedh' : 'Aubizo',
        logo: BRAND_ASSETS[brandKey]?.logo ?? BRAND_ASSETS.aubizo.logo,
    };
}
