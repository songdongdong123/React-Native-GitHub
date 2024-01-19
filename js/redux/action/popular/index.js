import Types from '../action_types';
import DataStore, {FLAG_STORAGE} from '../../../expand/dao/dataStore';
import handleData, {_projectModels} from '../ActionUtil';
/**
 * 获取最热数据的异步action
 *
 * @export
 * @param {*} storeName
 * @returns
 */
export function onLoadPopularData(storeName, url, pageSize, favoriteDao) {
  return dispatch => {
    // 派发刷新状态
    dispatch({type:Types.POPULAR_REFRESH, storeName: storeName});
    let dataStore = new DataStore();
    dataStore.fetchData(url, FLAG_STORAGE.flag_popular) // 异步action与数据流
             .then(data => {
                handleData(Types.POPULAR_REFRESH_SUCCESS, dispatch, storeName, data, pageSize, favoriteDao);
             })
             .catch(error => {
                console.log(error);
                dispatch({
                  type: Types.LOAD_POPULAR_FAIL,
                  storeName,
                  error
                });
             })
  }
}


/**
 *
 * @export
 * @param {*} storeName
 * @param {*} pageIndex 第几页
 * @param {*} pageSize 每页展示数据
 * @param {*} [dataArray=[]] 原始数据
 * @param {*} callback 回调函数，可以通过回调函数来向调用页面通信：比如异常信息的展示，没有更多等待
 */
export function onLoadMorePopular (storeName, pageIndex, pageSize, dataArray=[], favoriteDao, callback) {
  return dispatch => { // 模拟网络请求
    setTimeout(() => {
      if ((pageIndex - 1) * pageSize >= dataArray.length) { // 已加载完全部数据
        if (typeof callback === 'function') {
          callback('no more');
        }
        dispatch({
          type: Types.POPULAR_LOAD_MORE_FAIL,
          error: 'no more',
          storeName: storeName,
          pageIndex: --pageIndex
        })
      } else {
        let max = pageSize * pageIndex > dataArray.length ? dataArray.length : pageIndex * pageSize;
        _projectModels(dataArray.slice(0, max), favoriteDao, data => {
          dispatch({
            type: Types.POPULAR_LOAD_MORE_SUCCESS,
            storeName: storeName,
            pageIndex: pageIndex,
            projectModels: data
          })
        })
      }
    }, 500);
  }
}

/**
 *  刷新页面收藏状态
 * @param {*} storeName
 * @param {*} pageIndex
 * @param {*} pageSize
 * @param {*} [dataArray=[]]
 * @param {*} favoriteDao
 * @returns
 */
export function onFlushPopularFavorite (storeName, pageIndex, pageSize, dataArray = [], favoriteDao) {
  return dispatch => {
    // 本次和载入的最大数量
    let max = pageSize * pageIndex > dataArray.length ? dataArray.length : pageIndex * pageSize;
    _projectModels(dataArray.slice(0, max), favoriteDao, data => {
      dispatch({
        type: Types.FLUSH_POPULAR_FAVORITE,
        storeName: storeName,
        pageIndex: pageIndex,
        projectModels: data
      })
    })
  }
}