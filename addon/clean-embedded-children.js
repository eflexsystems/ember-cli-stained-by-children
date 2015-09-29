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
          this._processChildren(function(child) {
            var fragments = child._internalModel._fragments;
            var fragment;
            if (fragments) {
              for (var key in fragments) {
                if (fragment = fragments[key]) {
                  fragment._adapterDidCommit();
                }
              }
            }

            child.set('_internalModel._attributes', {});
          });
        }.bind(this)
    );
  },

  reload: function() {
    return this
      ._super()
      .then(
        function() {
          this._processChildren(function(child) {
            child.rollbackAttributes();
          });
        }.bind(this)
    );
  },

  rollbackAttributes: function() {
    this._processChildren(function(child) {
      child.rollbackAttributes();
    });
    return this._super();
  },

  rollback: function() {
    this._processChildren(function(child) {
      child.rollback();
    });
    return this._super();
  },

  _processChildren: function(callback) {
    this._processRelationshipsOneOrMany(function(child) {
      if ((child == null) || !child.get('hasDirtyAttributes')) {
        return;
      }

      child.send('willCommit');
      callback(child);
      child.send('didCommit');

      if (typeof child._processChildren === "function") {
        child._processChildren(function(child) {
          callback(child);
        });
      }
    });
  }
});

