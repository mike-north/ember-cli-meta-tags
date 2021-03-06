import Ember from 'ember';

const {
  get
} = Ember;

//TODO: consider polyfilled Set
const VALID_HEAD_TAGS = Ember.A([
  'base',
  'link',
  'meta',
  'script',
  'noscript',
  'title'
]);

const assign = Ember.assign ? Ember.assign : Ember.merge;

const keys = Object.keys || Ember.keys;

export default Ember.Service.extend({
  headData: Ember.inject.service(),

  // crawl up the active route stack and collect head tags
  collectHeadTags() {
    let tags = {};
    let currentHandlerInfos = this.get('router._routerMicrolib.currentHandlerInfos');
    if (!currentHandlerInfos) {
      currentHandlerInfos = this.get('router.router.currentHandlerInfos');
    }
    let handlerInfos = Ember.A(currentHandlerInfos);
    handlerInfos.forEach((handlerInfo) => {
      assign(tags, this._extractHeadTagsFromRoute(handlerInfo.handler));
    });
    let tagArray = Ember.A(keys(tags)).map((id) => tags[id]);
    this.set('headData.headTags', Ember.A(tagArray));
  },

  _extractHeadTagsFromRoute(route) {
    let headTags = get(route, 'headTags');
    if (!headTags) {
      return {};
    }
    if (typeof headTags === 'function') {
      headTags = headTags.apply(route);
    } else if (typeof headTags !== 'object') {
      // not recognized construct
      return {};
    }
    // convert headTags to object
    return this._buildTags(headTags);
  },

  // ensure all tags have a tagId and build object keyed by id
  _buildTags(headTagsArray) {
    let tagMap = {};
    Ember.A(headTagsArray).forEach(function(tagDefinition) {
      if(!VALID_HEAD_TAGS.includes(tagDefinition.type)) {
        return;
      }
      let tagId = tagDefinition.tagId;
      if (!tagId) {
        tagId = Ember.guidFor(tagDefinition);
      }
      tagMap[tagId] = tagDefinition;
    });
    return tagMap;
  }
});
