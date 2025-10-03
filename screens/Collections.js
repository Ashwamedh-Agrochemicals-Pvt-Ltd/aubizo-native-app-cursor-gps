import { StyleSheet, Text, View } from "react-native";


function CollectionScreen(_props) {
    return (

        <View style={styles.container}>
            <Text style={styles.title}>Collections</Text>
            <Text style={styles.message}>
                The Collections section is currently under development. Future updates
                will include collection history, billing details, and transaction
                management.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        textAlign: "center",
        color: "gray",
    },
});

export default CollectionScreen;
