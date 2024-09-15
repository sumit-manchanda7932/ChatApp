import { Dialog } from '@mui/material'
import React from 'react'

const ThemeDialog = ({open,handleClose}) => {
  return (
    <>
    <Dialog
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        keepMounted
        sx={{ p: 4 }}
      >
            
    </Dialog>
    </>
  )
}

export default ThemeDialog