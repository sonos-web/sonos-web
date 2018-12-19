/* eslint-disable */
/**
 * Object.prop()
 *
 * Allows dot-notation access to object properties for both getting and setting.
 *
 * @param {Object} obj    The object we're getting from or setting
 * @param {string} prop   The dot-notated string defining the property location
 * @param {mixed}  val    For setting only; the value to set
 */
Object.prop = function(obj, prop, val){
  var props = prop.split('.')
    , final = props.pop(), p 
  while(p = props.shift()){
      if (typeof obj[p] === 'undefined')
          return undefined;
      obj = obj[p]
  }
  return (obj[final] = val)
}