import { Box, Button, Card, Modal, TextField } from '@mui/material';
import React, { useState } from 'react';
import { useKeyDown } from '../../../hooks/useKeyDown';
import Cookies from 'js-cookie';
import Axios from '../../AxiosInstance';
import { AxiosError } from 'axios';
import { useContext } from 'react';
import GlobalContext from '../../context/GlobalContext';
import { useEffect } from 'react';

const CommentModal = ({ open = false, handleClose = () => {} }) => {
  const [textField, setTextField] = useState('');
  const [comments, setComments] = useState([]);
  const [error, setError] = useState({});
  const {user,setStatus} = useContext(GlobalContext);

  useKeyDown(() => {
    handleAddComment();
  }, ['Enter']);

  useEffect(() => {
    const userToken = Cookies.get('UserToken');
    if (userToken !== undefined && userToken !== 'undefined') {
      Axios.get('/comment', { headers: { Authorization: `Bearer ${userToken}` } }).then((res) => {
        const commentsData = res.data.data.map((comment) => ({
          id: comment.id,
          msg: comment.text,
        }));
        setComments(commentsData);
      });
    }
  }, []);

  const validateForm = () => {
    if (textField == '') {
      setError('Please input text!');
      return false;
    }
    setError('');
    setTextField('');
    return true;
  };

  const handleAddComment = async () => {
    // TODO implement logic
    if (!validateForm()) return;
    try {
      const userToken = Cookies.get('UserToken');
      const response = await Axios.post('/comment',createComment,{ text: textField }, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      if (response.data.success) {
        // TODO: show status of success here
        setComments([...comments, { id: Math.random(), msg: textField }]);
        resetAndClose();
      }
    }catch (error) {
      if (error instanceof AxiosError && error.response) {
        // TODO: show status of error from AxiosError here
        setStatus({ severity: 'error', msg: error.response.data.error});
      } else {
        // TODO: show status of other errors here
        setStatus({ severity: 'error', msg: error.message });
      }
    }
  };
  const resetAndClose = () => {
    setTimeout(() => {
      setComments('');
      setError({});
    }, 500);
    handleClose();
  };
  return (
    <Modal open={open} onClose={handleClose}>
      <Card
        sx={{
          width: { xs: '60vw', lg: '40vw' },
          maxWidth: '600px',
          maxHeight: '400px',
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: '16px',
          backgroundColor: '#ffffffCC',
          p: '2rem',
        }}
      >
        <Box
          sx={{
            display: 'flex',
          }}
        >
          <TextField
            value={textField}
            onChange={(e) => setTextField(e.target.value)}
            fullWidth
            placeholder="Type your comment"
            variant="standard"
          />
          <Button onClick={handleAddComment}>Submit</Button>
        </Box>
        <Box sx={{ overflowY: 'scroll', maxHeight: 'calc(400px - 2rem)' }}>
          {comments.map((comment) => (
            <Card key={comment.id} sx={{ p: '1rem', m: '0.5rem' }}>
              {comment.msg}
            </Card>
          ))}
        </Box>
      </Card>
    </Modal>
  );
};

export default CommentModal;