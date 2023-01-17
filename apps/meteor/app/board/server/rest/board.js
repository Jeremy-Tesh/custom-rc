import { API } from '../../../api/server/api';
import Board from '../models/boards';


API.v1.addRoute('boards/getBoard/:boardId', { authRequired: false }, {
	get() {
		const bd = Board.findOne({ _id: this.urlParams.boardId });
		return API.v1.success(bd);
	},
});
