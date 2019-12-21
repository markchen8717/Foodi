import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import Accordian from '../Components/Accordian'

export default function IngredientsPage(props) {
    return (
        <View >
            {props.ingrdnts_to_dscrption.map((obj) => {
                return <Accordian key={obj["name"]} title={obj["name"]} text_data={obj["text"]} visual_data={obj["visual"]} />;
            })}
        </View>
    );
}
