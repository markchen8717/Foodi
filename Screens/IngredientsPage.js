import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TextInput } from 'react-native';
import Accordian from '../Components/Accordian'

export default function IngredientsPage(props) {
    return (
        <View >
            {props.ingrdnts_to_dscrption.map((obj) => {
                let key = Object.keys(obj)[0];
                return <Accordian key={key} title={key} data={obj[key]} />;
            })}
        </View>
    );
}
