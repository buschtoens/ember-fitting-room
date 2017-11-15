import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { type } from '@ember-decorators/argument/type';
import { computed } from 'ember-decorators/object';

export default class SizePlaceholderComponent extends Component.extend({
  localClassNames: 'placeholder'
}) {
  static positionalParams = ['width', 'height'];

  @argument
  @type('number')
  width;

  @argument
  @type('number')
  height;

  @computed('width', 'height')
  ratio(width, height) {
    return Number.parseFloat((width / height).toPrecision(5), 10);
  }
}
