import InAppReview from 'react-native-in-app-review';
import { fetchDataAsync, setDataAsync } from '../API/Storage';
import { Alert, Modal, View, Text, Button } from 'react-native';
import React, { useState, useEffect } from 'react';
import Stars from 'react-native-stars';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const isRateReadyAsync = async () => {
    /*
        check for:
        last scan or search operation was successfull &&
        user not yet rated &&
        it has been over 5 operations since the last time user is asked to rate
    */
    const isUserRated = JSON.parse(await fetchDataAsync("isUserRated"));
    const numOfScansAndSearchesSinceR = JSON.parse(await fetchDataAsync("numOfScansAndSearchesSinceR"));
    return  !isUserRated && numOfScansAndSearchesSinceR > 55;
}

export const rateAsync = async () => {
    console.log("Rate!")
    setDataAsync("isUserRated",JSON.stringify(true));

    InAppReview.RequestInAppReview();

}


export function RateModal(props) {
    const [stars, setStars] = useState(5);

    return (
        <Modal visible={
            props.trigger
            }>
            <View style={{ flexDirection: "column", justifyContent: "center", alignContent: "center", height: "100%" }}>

                <Text style={{ fontSize: 25, textAlign: "center", fontWeight: "bold" }}>
                    Please Rate Foodi
                    </Text>
                <Text style={{ fontSize: 15, textAlign: "center", marginTop: 10 }}>
                    Your feedback is our motivation to do better!
                    </Text>

                <View style={{ alignContent: "center", marginTop: 20 }}>
                    <Stars
                        half={false}
                        default={5}
                        update={(val) => setStars(parseInt(val))}
                        spacing={4}
                        starSize={40}
                        count={5}
                        fullStar={<Icon name={'star'} size={40} style={{ color: "gold" }} />}
                        emptyStar={<Icon name={'star-outline'} size={40} />}
                        halfStar={<Icon name={'star-half'} size={40} />}
                    />
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-evenly", alignContent: "space-between", width: "100%", marginTop: 20 }}>

                    <Button title="Later" onPress={async () => {
                        await setDataAsync("numOfScansAndSearchesSinceR", JSON.stringify(0));
                        props.setTrigger(false)
                    }} />
                    <Button title="Rate" onPress={async () => {
                        await setDataAsync("numOfScansAndSearchesSinceR", JSON.stringify(0));
                        props.setTrigger(false)
                        if (stars > 3)
                            await rateAsync()
                    }} />
                </View>
            </View>
        </Modal>
    );

}