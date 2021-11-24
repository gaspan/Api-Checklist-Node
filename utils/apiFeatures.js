class APIFeatures {
  constructor(query, queryCount, queryString, req) {
    this.query = query;
    this.count = queryCount;
    this.queryString = queryString;
    this.req = req;
    this.links = {
      first : "",
      last: "",
      next: "",
      prev: ""
    }
    
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page_offset * 1 || 0;
    const limit = this.queryString.page_limit * 1 || 10;
    const skip = page * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.count = this.count.countDocuments();    
    return this;
  }

  paging(){

    const page = this.queryString.page_offset * 1 || 0;
    const limit = this.queryString.page_limit * 1 || 10;
    const skip = page * limit;

    let domain = this.req.protocol + '://' + this.req.get('host')
    let param = this.req.originalUrl.split('?')[1];
    let param_array = param.split('&')

    let page_offset
    let page_limit
    let fields
    let sort
    let filter
    let newFilter = ""
    for(let x= 0; x < param_array.length; x++){
          if (param_array[x].includes('page_offset')) {
            page_offset = param_array[x]
          }
          if (param_array[x].includes('page_limit')) {
            page_limit = param_array[x]
          }
          if (param_array[x].includes('fields')) {
            fields = param_array[x]
          }
          if (param_array[x].includes('sort')) {
            sort = param_array[x]
          }
          if (param_array[x].includes('filter')) {
            filter = decodeURI(param_array[x])
            newFilter = filter.split("\\");
          }
    }
    let param_page_offset = '&page_offset';
    let param_page_limit = '&page_limit='+limit
    if (page != 0) {
      let number = parseInt(page_offset.split('=')[1]) - 1
      param_page_offset = '&page_offset='+number
    }
    this.count.countDocuments().then(jumlah_item=>{

      if ( Math.ceil(jumlah_item / limit ) > (page +1) ) {
        let number = parseInt(page_offset.split('=')[1]) + 1
        param_page_offset = '&page_offset='+number
      }
      let prev = null
      if(page != 0){
        prev = domain + this.req.originalUrl.split('?')[0] + '?' + newFilter[0] + '&' + sort + '&' + fields + param_page_limit + param_page_offset
      }
      let next = null
      if ( Math.ceil(jumlah_item / limit ) > (page +1) ) {
        next = domain + this.req.originalUrl.split('?')[0] + '?' + newFilter[0] + '&' + sort + '&' + fields + param_page_limit + param_page_offset
      }
      let first = domain + this.req.originalUrl.split('?')[0] + '?' + newFilter[0] + '&' + sort + '&' + fields + param_page_limit + '&page_offset=0'
      let last = domain + this.req.originalUrl.split('?')[0] + '?' + newFilter[0] + '&' + sort + '&' + fields + param_page_limit + '&page_offset='+ (parseInt(page_offset.split('=')[1]) + ( Math.ceil(jumlah_item / limit ) > (page +1) ) ? 1 : 0 )


      this.links = {
        first : first,
        last: last,
        next: next,
        prev: prev
      }
      return this

    })
    
    return this
  }

  // Field Limiting ex: -----/user?fields=name,email,address
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    }
    return this;
  }
}

module.exports = APIFeatures;
