/* jshint newcap: false */
import Ember from "ember";
import Promise from "liquid-fire/promise";
import Velocity from "velocity";
var capitalize = Ember.String.capitalize;

export default Ember.Mixin.create({
  growDuration: 250,
  growPixelsPerSecond: 200,
  growEasing: 'slide',
  shrinkDelay: 0,
  growDelay: 0,
  growWidth: true,
  growHeight: true,

  transitionMap: Ember.inject.service('liquid-fire-transitions'),

  animateGrowth: function(elt, have, want) {
    this.get('transitionMap').incrementRunningTransitions();
    var adaptations = [];

    if (this.get('growWidth')) {
      adaptations.push(this._adaptDimension(elt, 'width', have, want));
    }

    if (this.get('growHeight')) {
      adaptations.push(this._adaptDimension(elt, 'height', have, want));
    }

    return Promise.all(adaptations).then(()=>{
      this.get('transitionMap').decrementRunningTransitions();
    });
  },

  _adaptDimension: function(elt, dimension, have, want) {
    if (have[dimension] === want[dimension]) {
      return Promise.resolve();
    }
    var target = {};
    target['outer'+capitalize(dimension)] = [
      want[dimension],
      have[dimension],
    ];
    return Velocity(elt[0], target, {
      delay: this._delayFor(have[dimension], want[dimension]),
      duration: this._durationFor(have[dimension], want[dimension]),
      queue: false,
      easing: this.get('growEasing') || this.constructor.prototype.growEasing
    });
  },

  _delayFor: function(before, after) {
    if (before > after) {
      return this.get('shrinkDelay') || this.constructor.prototype.shrinkDelay;
    }

    return this.get('growDelay') || this.constructor.prototype.growDelay;
  },

  _durationFor: function(before, after) {
    return Math.min(this.get('growDuration') || this.constructor.prototype.growDuration, 1000*Math.abs(before - after)/(this.get('growPixelsPerSecond') || this.constructor.prototype.growPixelsPerSecond));
  }

});
