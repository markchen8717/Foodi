import React, { Fragment, useState, useEffect } from 'react';
import { Linking, View, TouchableOpacity, Text, StyleSheet, Image} from "react-native";
import { Colors } from './Colors';
import Icon from "react-native-vector-icons/MaterialIcons";

export default function Accordian(props) {

    const [expanded, setExpanded] = useState(false);
    const [collapse_all, setCollapseAlll] = useState(props.collapse_all);

    toggleExpand = () => {
        setExpanded((prevState) => { return !prevState; });
    }

    useEffect(() => {
        if(props.collapse_all != collapse_all)
        {
            setExpanded(false);
            setCollapseAlll(!collapse_all);           
        }
    });

    return (
        <View>
            <TouchableOpacity style={styles.row} onPress={toggleExpand}>
                <Text style={[styles.title, styles.font]}>{props.title}</Text>
                <Icon name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={30} color={Colors.DARKGRAY} />
            </TouchableOpacity>

            {expanded &&
                <View style={styles.child}>
                    <Text>{props.text_data}</Text>
                    <Fragment>
                        {props.visual_data !== null &&
                            <Image
                                style={styles.visual_data}
                                source={{ uri: props.visual_data }}
                            />
                        }
                    </Fragment>
                    <Text style={{ fontSize: 15, color: "blue" }} title="Details" onPress={() => Linking.openURL(props.page_url)}>See Details</Text>
                </View>
            }
        </View>
    );

}

const styles = StyleSheet.create({
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.DARKGRAY,
    },
    row: {
        marginTop: '1.5%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 56,
        paddingLeft: 25,
        paddingRight: 18,
        alignItems: 'center',
        backgroundColor: '#FFFACD',
    },
    parentHr: {
        height: 1,
        color: Colors.WHITE,
        width: '100%'
    },
    child: {
        backgroundColor: Colors.LIGHTGRAY,
        padding: 16,
    },
    visual_data: {
        resizeMode:'contain',
        flexDirection: 'row',
        alignItems: 'center',
        height: 200,
        width: 200,
    }

});
