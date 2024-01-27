import { useEffect, useState, useRef } from 'react';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Slide, { SlideProps } from '@mui/material/Slide';
import Snackbar from '@mui/material/Snackbar';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { CombinedData } from '../main';

function SlideTransition(props: Readonly<SlideProps>) {
  return <Slide {...props} direction='down' />;
}

type FileUploaderProps = {
  onDataLoaded: (data: CombinedData) => void;
  isDataLoaded: boolean;
  setIsLoading: (isLoading: boolean) => void;
};

const FileUploader: React.FC<FileUploaderProps> = ({
  onDataLoaded,
  isDataLoaded,
  setIsLoading,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState<string>('');
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [status, setStatus] = useState<'success' | 'fail' | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (file) {
      handleUpload();
    }
  }, [file]);

  useEffect(() => {
    if (status === 'success' || status === 'fail') {
      const message =
        status === 'success'
          ? 'File uploaded successfully!'
          : 'File upload failed! Only CSV files are allowed.';

      setSnackbarMessage(message);
      setOpenSnackbar(true);
    }
  }, [status]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    if (status === 'success') {
      setTimeout(() => {
        setStatus(null);
      }, 500);
    } else {
      setStatus(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setStatus(null);
      setFile(e.target.files[0]);
      setFilename(e.target.files[0].name);
    }
  };

  const handleIconClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = async () => {
    if (file) {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const result = await fetch(`${import.meta.env.VITE_BACKEND_URL_UPLOAD}`, {
          method: 'POST',
          body: formData,
        });

        const data = await result.json();
        if (data) {
          onDataLoaded({
            fullData: data.full_data,
            columnSuggestions: data.column_suggestions,
          });
          setStatus('success');
        } else {
          throw new Error('File upload failed');
        }
      } catch (error) {
        console.error(error);
        setStatus('fail');
        setFilename('');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      <Container style={{ marginTop: '10px' }}>
        <Box style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          {isDataLoaded ? (
            <Chip label={`Loaded: ${filename}`} color='success' />
          ) : (
            <Chip label='Start here 👉' color='primary' variant='outlined' />
          )}
          <input
            id='file'
            type='file'
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }} // Hide the file input
          />
          <IconButton aria-label='upload-file' component='span' onClick={handleIconClick}>
            <UploadFileIcon />
          </IconButton>
          <IconButton aria-label='user-profile' component='span'>
            <AccountCircle />
          </IconButton>
        </Box>
      </Container>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        TransitionComponent={SlideTransition}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={status === 'success' ? 'success' : 'error'}
          style={{ borderRadius: '10px' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FileUploader;
