# JSX Reconstructor

This project was made with the intention of turning compiled React code back into JSX.
Tested with pre and post-SWC Discord builds and React Native builds.

## Example

Using the 2020 Discord React Native source leak _(components-ios/UserActivity.js)_:

### Before

```js
var view = _jsx(
  _reactNative.View,
  {
    style: styles.images,
  },
  void 0,
  _jsx(_reactNative.Image, {
    source: {
      uri: (0, _ApplicationAssetUtils.getAssetImage)(
        applicationId,
        assets.large_image,
        (0, _isStreaming.default)(activity) ? TWITCH_IMAGE_SIZE : IMAGE_SIZE
      ),
    },
    style: [
      styles.largeImage,
      (0, _isStreaming.default)(activity) && styles.largeImageTwitch,
    ],
  }),
  smallImage
);
```

### After

```jsx
var view = (
  <ReactNative.View style={styles.images}>
    <ReactNative.Image
      source={{
        uri: ApplicationAssetUtils.getAssetImage(
          applicationId,
          assets.large_image,
          IsStreaming(activity) ? TWITCH_IMAGE_SIZE : IMAGE_SIZE
        ),
      }}
      style={[
        styles.largeImage,
        IsStreaming(activity) && styles.largeImageTwitch,
      ]}
    />
    {smallImage}
  </ReactNative.View>
);
```

### Before

```js
var TimeStamp =
  /*#__PURE__*/
  (function (_React$PureComponent) {
    _inheritsLoose(_class, _React$PureComponent);

    function _class() {
      return _React$PureComponent.apply(this, arguments) || this;
    }

    var _proto = _class.prototype;

    _proto.render = function render() {
      var _this$props = this.props,
        message = _this$props.message,
        style = _this$props.style;
      return _jsx(
        _Atoms.Text,
        {
          style: style,
        },
        void 0,
        message
      );
    };

    return _class;
  })(React.PureComponent);
```

### After

```jsx
class TimeStamp extends React.PureComponent {
  render() {
    var message = this.message,
      style = this.style;
    return <Atoms.Text style={style}>{message}</Atoms.Text>;
  }
}
```

## Caution!

This code is extremely shit and WIP. Please do give it a try and create an issue if you find any problems! Please provide some example code that I can work with to diagnose the issue. Thanks :)

## Usage

1. `npm install`
2. Create a folder called `input` and place your `.js` files in there.
3. Run `npm run start`

Copyright &copy; 2024, https://github.com/MeguminSama, https://github.com/vftable and https://github.com/0xeac7
