# Architecture review

- [ ] Each scene has one responsibility
- [ ] No gameplay logic hidden in asset preload
- [ ] No global mutation without typed facade
- [ ] Hot path code allocates minimally
- [ ] Persistent state has versioned schema
- [ ] UI overlay scenes do not own gameplay objects
