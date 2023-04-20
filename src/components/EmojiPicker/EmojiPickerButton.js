import React, {useCallback, useEffect, useRef} from 'react';
import {Pressable} from 'react-native';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../styles/styles';
import * as StyleUtils from '../../styles/StyleUtils';
import getButtonState from '../../libs/getButtonState';
import * as Expensicons from '../Icon/Expensicons';
import Tooltip from '../Tooltip';
import Icon from '../Icon';
import withLocalize, {withLocalizePropTypes} from '../withLocalize';
import * as EmojiPickerAction from '../../libs/actions/EmojiPickerAction';

const propTypes = {
    /** Flag to disable the emoji picker button */
    isDisabled: PropTypes.bool,

    /** Id to use for the emoji picker button */
    nativeID: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    isDisabled: false,
    nativeID: '',
};

const EmojiPickerButton = (props) => {
    const emojiPopoverAnchor = useRef(null);

    const executeClick = useCallback((e) => {
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        const allowed = _.some(elements, element => emojiPopoverAnchor.current.contains(element));
        if (allowed) {
            const event = new Event('contextmenuopened');
            window.dispatchEvent(event);

            EmojiPickerAction.showEmojiPicker(props.onModalHide, props.onEmojiSelected, emojiPopoverAnchor.current);
        }
    }, [emojiPopoverAnchor]);

    useEffect(() => {
        window.addEventListener('click', executeClick, true);

        return () => {
            window.removeEventListener('click', executeClick);
        };
    }, [executeClick]);

    return (
        <Tooltip containerStyles={[styles.alignSelfEnd]} text={props.translate('reportActionCompose.emoji')}>
            <Pressable
                ref={emojiPopoverAnchor}
                style={({hovered, pressed}) => ([
                    styles.chatItemEmojiButton,
                    StyleUtils.getButtonBackgroundColorStyle(getButtonState(hovered, pressed)),
                ])}
                disabled={props.isDisabled}
                nativeID={props.nativeID}
            >
                {({hovered, pressed}) => (
                    <Icon
                        src={Expensicons.Emoji}
                        fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                    />
                )}
            </Pressable>
        </Tooltip>
    );
};

EmojiPickerButton.propTypes = propTypes;
EmojiPickerButton.defaultProps = defaultProps;
EmojiPickerButton.displayName = 'EmojiPickerButton';
export default withLocalize(EmojiPickerButton);
