import React, { Component } from 'react';
import {
  Dimensions,
  StyleSheet,
  View,
  ScrollView,
  Animated,
  Image
} from 'react-native';
import PropTypes from 'prop-types';

import ScrollableMixin from 'react-native-scrollable-mixin';

/**
 * BlurView temporarily removed until semver stuff is set up properly
 */
// var BlurView;

const screen = Dimensions.get('window');
const ScrollViewPropTypes = ScrollView.propTypes;

class ParallaxView extends Component {
  static propTypes = {
    ...ScrollViewPropTypes,
    windowHeight: PropTypes.number,
    backgroundHeight: PropTypes.number,
    backgroundSource: PropTypes.oneOfType([
      PropTypes.shape({
        uri: PropTypes.string,
      }),
      // Opaque type returned by require('./image.jpg')
      PropTypes.number,
    ]),
    header: PropTypes.node,
    blur: PropTypes.string,
    contentInset: PropTypes.object,
  }

  static defaultProps = {
    windowHeight: 300,
    backgroundHeight: 300,
    contentInset: {
      top: screen.scale
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      fixed: false,
      scrollY: new Animated.Value(0)
    }
  }

  /**
   * IMPORTANT: You must return the scroll responder of the underlying
   * scrollable component from getScrollResponder() when using ScrollableMixin.
   */
  getScrollResponder() {
    return this._scrollView.getScrollResponder();
  }

  setNativeProps(props) {
    this._scrollView.setNativeProps(props);
  }

  onScroll(event) {
    this.setState({
      fixed: event.nativeEvent.contentOffset.y > this.props.windowHeight,
    });
    this.props.onScroll(event);
  }

  renderBackground() {
    const { windowHeight, backgroundHeight, backgroundSource, blur } = this.props;
    const { scrollY } = this.state;
    if (!windowHeight || !backgroundSource) {
      return null;
    }

    if (this.state.fixed) {
      return (
        <View style={styles.backgroundWrapper}>
          <Image style={[styles.background, { height: backgroundHeight, }]} source={backgroundSource} />
        </View>
      );
    }
    return (
      <Animated.Image
        style={[styles.background, {
          height: backgroundHeight,
          transform: [{
            translateY: scrollY.interpolate({
              inputRange: [-backgroundHeight, 0, backgroundHeight],
              outputRange: [backgroundHeight / 2, 0, -backgroundHeight]
            })
          }, {
            scale: scrollY.interpolate({
              inputRange: [-backgroundHeight, 0, backgroundHeight],
              outputRange: [2, 1, 1]
            })
          }]
        }]}
        source={backgroundSource}>
        {/*
                    !!blur && (BlurView || (BlurView = require('react-native-blur').BlurView)) &&
                    <BlurView blurType={blur} style={styles.blur} />
                */}
      </Animated.Image>
    );
  }

  renderHeader() {
    const { windowHeight, backgroundSource } = this.props;
    const { scrollY } = this.state;
    if (!windowHeight || !backgroundSource) {
      return null;
    }
    return (
      <Animated.View style={{
        position: 'relative',
        height: windowHeight,
        opacity: scrollY.interpolate({
          inputRange: [-windowHeight, 0, windowHeight / 1.2],
          outputRange: [1, 1, 0]
        }),
      }}>
        {this.props.header}
      </Animated.View>
    );
  }

  render() {
    const { style, backgroundHeight, ...props } = this.props;
    return (
      <View style={[styles.container, style]}>
        {this.renderBackground()}
        < ScrollView
          ref={component => { this._scrollView = component; }}
          {...props }
          style={styles.scrollView}
          onScroll={
            Animated.event(
              [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
              { listener: this.onScroll }
            )
          }
          scrollEventThrottle={1}>
          {this.renderHeader()}
          < View style={[styles.content, props.scrollableViewStyle]}>
            {this.props.children}
          </View>
        </ScrollView>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderColor: 'transparent',
  },
  scrollView: {
    backgroundColor: 'transparent',
  },
  backgroundWrapper: {
    width: screen.width,
    position: 'absolute',
    backgroundColor: '#2e2f31',
    height: 60,
    justifyContent: 'flex-end',
  },
  background: {
    position: 'absolute',
    width: screen.width,
    resizeMode: 'cover',
  },
  blur: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  content: {
    shadowColor: '#222',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    backgroundColor: '#fff',
    flex: 1,
    flexDirection: 'column'
  }
});

Object.assign(ParallaxView.prototype, ScrollableMixin);

export default ParallaxView;
