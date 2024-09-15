import { createSlice } from "@reduxjs/toolkit";

const user_id = window.localStorage.getItem("user_id");
const initialState = {
  direct_chat: {
    conversations: [],
    current_conversation: null,
    current_messages: null,
  },
  group_chat: {},
};

const slice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    fetchDirectConversations(state, action) {
      const list = action.payload.conversations.map((el) => {
        const this_user = el.participants.find(
          (elm) => elm._id.toString() !== user_id
        );
        return {
          id: el._id,
          user_id: this_user._id,
          name: `${this_user.firstName} ${this_user.lastName}`,
          online: this_user.status,
          img: this_user.avatar,
          msg:el.lastMessage,
          time: el.lastMessageTime,
          unread: 0,
          pinned: false,
        };
      });
      console.log(list,"list");
      state.direct_chat.conversations = list;
    },
    updateDirectConversation(state, action) {
      const this_conversation = action.payload.conversation;
      state.direct_chat.conversations = state.direct_chat.conversations.map(
        (el) => {
          if (el.id !== this_conversation._id) {
            return el;
          } else {
            const user = this_conversation.participants.find(
              (elm) => elm._id.toString() !== user_id
            );
            return {
              id: this_conversation._id,
              user_id: user._id,
              name: `${user.firstName} ${user.lastName}`,
              online: user.status,
              img: user.avatar,
              msg: el.lastMessage,
              time: el.lastMessageTime,
              unread: 0,
              pinned: false,
            };
          }
        }
      );
    },
    addDirectConversation(state, action) {
      const this_conversation = action.payload.conversation;
      const user = this_conversation.participants.find(
        (elm) => elm._id.toString() !== user_id
      );
      state.direct_chat.conversations.push({
        id: this_conversation._id,
        user_id: user._id,
        name: `${user.firstName} ${user.lastName}`,
        online: user.status ,
        img: user.avatar,
        msg: this_conversation.lastMessage,
        time: this_conversation.lastMessageTime,
        unread: 0,
        pinned: false,
      });
    },
    setCurrentConversation(state, action) {
        state.direct_chat.current_conversation = action.payload;
      },
      fetchCurrentMessages(state, action) {
        const messages = action.payload.messages;
        const formatted_messages = messages.map((el) => (el.type==="divider"?{
            id: el._id,
          type: "divider",
          subtype: el.type,
          text: el.text,
          incoming: el.to === user_id,
          outgoing: el.from === user_id,
          time:el.created_at,
        }:{
          id: el._id,
          type: "msg",
          subtype: el.type,
          message: el.text,
          incoming: el.to === user_id,
          outgoing: el.from === user_id,
          time:el.created_at,
        }));
        state.direct_chat.current_messages = formatted_messages;
      },
      addDirectMessage(state, action) {
        state.direct_chat.current_messages.push(action.payload.message);
      },
      changeConversationStatus(state,action){
        const {status,id}=action.payload;
        state.direct_chat.conversations=state.direct_chat.conversations.map(
            (el) => {
              if (el.user_id !== id) {
                return el;
              } else {
                el.online=status;
                return el;
              }
            }
          );
          if(state.direct_chat.current_conversation.user_id===id){
            state.direct_chat.current_conversation.online=status;
          }
      }
  },
  
});

export default slice.reducer;

export const FetchDirectConversations = ({ conversations }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.fetchDirectConversations({ conversations }));
  };
};

export const UpdateDirectConversation = ({ conversation }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.updateDirectConversation({ conversation }));
  };
};
export const AddDirectConversation = ({ conversation }) => {
  return async (dispatch, getState) => {
    dispatch(slice.actions.addDirectConversation({ conversation }));
  };
};
export const SetCurrentConversation = (current_conversation) => {
    return async (dispatch, getState) => {
      dispatch(slice.actions.setCurrentConversation(current_conversation));
    };
  };
  
  
  export const FetchCurrentMessages = ({messages}) => {
    return async(dispatch, getState) => {
      dispatch(slice.actions.fetchCurrentMessages({messages}));
    }
  }
  
  export const AddDirectMessage = (message) => {
    return async (dispatch, getState) => {
      dispatch(slice.actions.addDirectMessage({message}));
    }
  }

  export const ChangeConversationStatus = (data) => {
    return async (dispatch, getState) => {
      dispatch(slice.actions.changeConversationStatus(data));
    };
  };
