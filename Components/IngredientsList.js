import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, ScrollView } from 'react-native';
import Accordian from '../Components/Accordian';
import Header from '../Components/Header';


export default function IngredientsList(props) {

    const [collapse_all, toggleCollapseAll] = useState(true);
    const handleCollapseAllButton = () => {
        toggleCollapseAll(!collapse_all);
    }

    return (
        <View style={style.container}>
            <View style={style.header}>
                <Header style={{ backgroundColor: '#40E0D0' }} title="Ingredients Found:" />
            </View>
            <View style={style.content}>
                <View style={{ alignItems: 'center', paddingTop: '2%', }}>
                    <Button title="Collapse All" onPress={handleCollapseAllButton} />
                    {props.ingrdnts_to_dscrption.length == 0 && !props.is_searching && <Text>No Results</Text>}
                    {props.is_searching && <Text >Loading...</Text>}
                    {props.ingrdnts_to_dscrption.length == 0 && props.instructions != null && <Text style={{ color: 'grey', padding: '5%' }}>{props.instructions}</Text>}
                </View>
                <ScrollView contentContainerStyle={{ margin: "2.5%" }}>
                    {props.ingrdnts_to_dscrption.map((obj) => {
                        return <Accordian collapse_all={collapse_all} key={obj["name"]} title={obj["name"]} text_data={obj["text"]} visual_data={obj["visual"]} page_url={obj["page_url"]} />;
                    })}
                </ScrollView>
            </View>
        </View>
    );
}

const style = StyleSheet.create({
    container: {
        height: '100%',
        width: '100%',
        overflow: 'hidden'
    },
    header: {
        flex: 10,
        overflow: 'hidden',
    },
    content: {
        flex: 80,
        backgroundColor: 'white',
        overflow: 'hidden',
    }
});