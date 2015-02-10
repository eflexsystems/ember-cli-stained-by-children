import Ember from 'ember';

export default Ember.Mixin.create({

  _processRelationships: function(callback) {
    this.eachRelationship(function(relationshipName, relationship) {
      if (relationship.options.embeddedChild) {
        callback(relationshipName, relationship);
      }
    });
  },


  _processRelationshipsOneOrMany: function(callback) {
    this._processRelationships(
      function(relationshipName, relationship) {
        var itemOrItems = this.get(relationshipName);
        switch (relationship.kind) {
          case 'belongsTo':
            callback(itemOrItems);
            break;
          case 'hasMany':
            itemOrItems.forEach(function(child) {
              callback(child);
            });
        }
      }.bind(this)
    );
  },


  save: function() {
    return this
      ._super()
      .then(
        function() {
          this._cleanChildren();
        }.bind(this)
    );
  },


  _cleanChildren: function() {
    this._processRelationshipsOneOrMany(function(child) {
      if ((child == null) || !child.get('isDirty')) {
        return;
      }

      child.send('willCommit');
      child.set('_attributes', {});
      child.send('didCommit');

      if (typeof child._cleanChildren === "function") {
        child._cleanChildren();
      }
    });
  }
});
