export function handlebarsHelpers() {
  return {
    eq: (v1, v2) => v1 === v2,
    neq: (v1, v2) => v1 !== v2,
    or: (v1, v2) => v1 || v2,
    ternary: (cond, v1, v2) => cond ? v1 : v2,

    allCaps: (text) => text.toUpperCase(),

    strOrSpace: val => {
      if (typeof val === 'string') {
        return (val && !!val.length) ? val : '&nbsp;';
      }

      return val;
    },

    sortIcon: (sortInfo, field) => {
      if (sortInfo.field !== field) {
        return '';
      }

      return `&nbsp;<i class="fas fa-long-arrow-alt-${sortInfo.asc ? 'up' : 'down'}"></i>`;
    }
  };
}
