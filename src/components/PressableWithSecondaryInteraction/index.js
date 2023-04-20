import _ from 'underscore';
import React, {Component} from 'react';
import {Pressable} from 'react-native';
import * as pressableWithSecondaryInteractionPropTypes from './pressableWithSecondaryInteractionPropTypes';
import styles from '../../styles/styles';
import * as DeviceCapabilities from '../../libs/DeviceCapabilities';

/**
 * This is a special Pressable that calls onSecondaryInteraction when LongPressed, or right-clicked.
 */
class PressableWithSecondaryInteraction extends Component {
    constructor(props) {
        super(props);
        this.executeSecondaryInteractionOnContextMenu = this.executeSecondaryInteractionOnContextMenu.bind(this);
        this.handleContextMenuOpened = this.handleContextMenuOpened.bind(this);
    }

    componentDidMount() {
        if (this.props.forwardedRef && _.isFunction(this.props.forwardedRef)) {
            this.props.forwardedRef(this.pressableRef);
        }
        window.addEventListener('contextmenu', this.executeSecondaryInteractionOnContextMenu);
        window.addEventListener('contextmenuopened', this.handleContextMenuOpened);
    }

    componentWillUnmount() {
        window.removeEventListener('contextmenu', this.executeSecondaryInteractionOnContextMenu);
        window.removeEventListener('contextmenuopened', this.handleContextMenuOpened);
    }

    /**
     * Hide context menu if another context menu has been opened.
     * @param {Event} e - A custom contextmenuopened event.
     * */
    handleContextMenuOpened(e) {
        this.props.onSecondaryInteractionOut(e);
    }

    /**
     * @param {contextmenu} e - A right-click MouseEvent.
     * https://developer.mozilla.org/en-US/docs/Web/API/Element/contextmenu_event
     */
    executeSecondaryInteractionOnContextMenu(e) {
        const event = new Event('contextmenuopened');
        window.dispatchEvent(event);

        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        const allowed = _.some(elements, element => this.pressableRef.contains(element));

        if (allowed) {
            e.stopPropagation();
            if (this.props.preventDefaultContentMenu) {
                e.preventDefault();
            }

            /**
             * This component prevents the tapped element from capturing focus.
             * We need to blur this element when clicked as it opens modal that implements focus-trapping.
             * When the modal is closed it focuses back to the last active element.
             * Therefore it shifts the element to bring it back to focus.
             * https://github.com/Expensify/App/issues/14148
             */
            if (this.props.withoutFocusOnSecondaryInteraction && this.pressableRef) {
                this.pressableRef.blur();
            }
            this.props.onSecondaryInteraction(e);
        } else {
            this.props.onSecondaryInteractionOut(e);
        }
    }

    render() {
        const defaultPressableProps = _.omit(this.props, ['onSecondaryInteraction', 'children', 'onLongPress']);

        // On Web, Text does not support LongPress events thus manage inline mode with styling instead of using Text.
        return (
            <Pressable
                style={this.props.inline && styles.dInline}
                onPressIn={this.props.onPressIn}
                onLongPress={(e) => {
                    if (DeviceCapabilities.hasHoverSupport()) {
                        return;
                    }
                    if (this.props.withoutFocusOnSecondaryInteraction && this.pressableRef) {
                        this.pressableRef.blur();
                    }
                    this.props.onSecondaryInteraction(e);
                }}
                onPressOut={this.props.onPressOut}
                onPress={this.props.onPress}
                ref={el => this.pressableRef = el}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...defaultPressableProps}
            >
                {this.props.children}
            </Pressable>
        );
    }
}

PressableWithSecondaryInteraction.propTypes = pressableWithSecondaryInteractionPropTypes.propTypes;
PressableWithSecondaryInteraction.defaultProps = pressableWithSecondaryInteractionPropTypes.defaultProps;
export default React.forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <PressableWithSecondaryInteraction {...props} forwardedRef={ref} />
));
