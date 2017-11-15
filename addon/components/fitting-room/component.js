import Component from '@ember/component';
import { get, setProperties } from '@ember/object';
import { throttle } from '@ember/runloop';
import { htmlSafe } from '@ember/string';
import { argument } from '@ember-decorators/argument';
import { type } from '@ember-decorators/argument/type';
import { required } from '@ember-decorators/argument/validation';
import { action, computed } from 'ember-decorators/object';
import { reads } from 'ember-decorators/object/computed';
import { attribute } from 'ember-decorators/component';
import layout from './template';
import styles from './styles';

const { max, min } = Math;

const FIT_TO_BOTH = 'both';
const FIT_TO_WIDTH = 'width';
const FIT_TO_HEIGHT = 'height';

// FIXME: https://github.com/salsify/ember-css-modules/issues/88
// @localClassNames('fitting-room')
export default class FittingRoomComponent extends Component.extend({
  layout,
  styles,
  localClassNames: 'fitting-room',
  localClassNameBindings: ['alignmentClasses']
}) {
  static positionalParams = ['width', 'height'];

  roomWidth = 0;
  roomHeight = 0;

  @argument
  @type('number')
  // @validate(isPositive)
  @required
  width;

  @argument
  @type('number')
  @required
  minWidth = 0;

  @argument
  @type('number')
  @required
  maxWidth = Number.POSITIVE_INFINITY;

  @argument
  @type('number')
  // @validate(isPositive)
  @required
  height;

  @argument
  @type('number')
  @required
  minHeight = 0;

  @argument
  @type('number')
  @required
  maxHeight = Number.POSITIVE_INFINITY;

  @argument
  @type('string')
  // FIXME: https://github.com/ember-decorators/argument/issues/30
  // @type(enum(FIT_TO_BOTH, FIT_TO_WIDTH, FIT_TO_HEIGHT))
  @required
  fitTo = FIT_TO_BOTH;

  @argument
  @type('string')
  // FIXME: https://github.com/ember-decorators/argument/issues/30
  // @type(enum('center', 'left', 'right'))
  @required
  alignHorizontally = 'center';

  @argument
  @type('string')
  // FIXME: https://github.com/ember-decorators/argument/issues/30
  // @type(enum('center', 'top', 'bottom'))
  @required
  alignVertically = 'center';

  @argument
  @type('number')
  // @validate(isPositive)
  @required
  denounceInterval = 1000 / 60;

  // FIXME: https://github.com/salsify/ember-css-modules/issues/88
  // @localClassName
  @computed('alignHorizontally', 'alignVertically')
  alignmentClasses(h, v) {
    return `align-horizontally--${h} align-vertically--${v}`;
  }

  @computed('width', 'roomWidth')
  widthScalingFactor(width, roomWidth) {
    return roomWidth / width;
  }

  @computed('height', 'roomHeight')
  heightScalingFactor(height, roomHeight) {
    return roomHeight / height;
  }

  @computed(
    'fitTo',
    'widthScalingFactor',
    'heightScalingFactor',
    'width',
    'maxWidth',
    'minWidth',
    'height',
    'maxHeight',
    'minHeight'
  )
  fittedSize(
    fitTo,
    widthScalingFactor,
    heightScalingFactor,
    width,
    maxWidth,
    minWidth,
    height,
    maxHeight,
    minHeight
  ) {
    const fitToWidth =
      fitTo === FIT_TO_WIDTH || widthScalingFactor <= heightScalingFactor;
    const scalingFactor = fitToWidth ? widthScalingFactor : heightScalingFactor;

    const scaledWidth = width * scalingFactor;
    const scaledHeight = height * scalingFactor;
    const cappedWidth = min(maxWidth, max(minWidth, scaledWidth));
    const cappedHeight = min(maxHeight, max(minHeight, scaledHeight));

    if (fitToWidth) {
      if (cappedWidth !== scaledWidth) {
        return { width: cappedWidth, height: height * cappedWidth / width };
      }
      if (cappedHeight !== scaledHeight) {
        return { width: width * cappedHeight / height, height: cappedHeight };
      }
    } else {
      if (cappedHeight !== scaledHeight) {
        return { width: width * cappedHeight / height, height: cappedHeight };
      }
      if (cappedWidth !== scaledWidth) {
        return { width: cappedWidth, height: height * cappedWidth / width };
      }
    }

    return { width: scaledWidth, height: scaledHeight };
  }

  @reads('fittedSize.width') fittedWidth;
  @reads('fittedSize.height') fittedHeight;

  @attribute
  @computed('minWidth', 'minHeight')
  style(minWidth, minHeight) {
    return htmlSafe(`min-width: ${minWidth}px; min-height: ${minHeight}px;`);
  }

  @computed('fittedWidth', 'fittedHeight')
  fittedStyle(fittedWidth, fittedHeight) {
    return htmlSafe(`width: ${fittedWidth}px; height: ${fittedHeight}px;`);
  }

  updateDimensions(width, height) {
    setProperties(this, {
      roomWidth: width,
      roomHeight: height
    });
  }

  @action
  handleResize({ width, height }) {
    throttle(
      this,
      'updateDimensions',
      width,
      height,
      get(this, 'debounceInterval'),
      false
    );
  }
}
