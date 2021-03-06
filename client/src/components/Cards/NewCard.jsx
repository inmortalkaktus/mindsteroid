import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router';
import styled from 'styled-components';
import { Button, Grid, Snackbar } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import Editor from '../Utils/TextEditor';

import { createCard } from '../../actions/cards';
import { darkTextColor, primaryEmerald, primaryDarkEmerald, primaryRed, primaryRed2, inputSvgColor, primaryBlue, backgroundLightBlue } from '../../utils';
import { MdSettings } from 'react-icons/md';
import ConfigDialog from './ConfigDialog';

const NewCard = () => {

    const [ openDialog, setOpenDialog ] = useState(false);
    const [ snackbarOpen, setSnackbarOpen ] = useState(false);
    const [ keepAddLazy, setKeepAddLazy ] = useState(false); // Needed to update everytime the real changes
    const [ snackbarStatus, setSnackbarStatus ] = useState({
        severity: "success", 
        message: "Tarjeta añadida correctamente"
    });
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const keepAdding = useRef(false);
    const questionRef = useRef();
    const answerRef = useRef();
    
    const { id: deckId } = useParams();

    const handleNewCard = async () => {
        const question = questionRef.current?.getInnerHtml();
        const answer = answerRef.current?.getInnerHtml();

        const cleanQuestion = getHTMLText(question).replace(' ', '');
        const cleanAnswer = getHTMLText(answer).replace(' ', '');
        
        if (cleanQuestion != '' && cleanAnswer != '') {
            const user = JSON.parse(localStorage.getItem('profile'))
    
            const card = {
                question: question,
                answer: answer,
                parent: deckId,
                creator: user?.result?._id,
            }
            
            try {
                await dispatch(createCard({...card}, deckId))
                if (keepAdding.current) {
                    setSnackbarStatus({
                        severity: "success", 
                        message: "Tarjeta añadida correctamente"
                    })
                    handleOpenSnackbar();
                    questionRef.current?.cleanInnerHtml();
                    answerRef.current?.cleanInnerHtml();
                } else {
                    returnToDeck();
                }
            } catch (error) {
                setSnackbarStatus({
                    severity: "error", 
                    message: `ERROR: ${ error.message }`
                })
                handleOpenSnackbar();
            }
        } else {
            setSnackbarStatus({
                severity: "error", 
                message: (cleanAnswer != '') ? "El campo 'Pregunta' no puede estar vacío." : 
                        (cleanQuestion != '') ? "El campo 'Respuesta' no puede estar vacío." :
                        "Los campos 'Pregunta' y 'Respuesta' no pueden estar vacíos."
            })
            handleOpenSnackbar();
        }
    }

    const getHTMLText = (html) => {
        var divContainer= document.createElement("div");
        divContainer.innerHTML = html;
        return divContainer.textContent || divContainer.innerText || "";
    }

    const returnToDeck = () => {
        navigate(`/deck/${ deckId }`);
    }

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleKeepAdding = () => {
        console.log('from:', keepAdding.current)
        keepAdding.current = !keepAdding.current;
        setKeepAddLazy(keepAdding.current)
        console.log('to:', keepAdding.current)
        localStorage.setItem('keepAddingCards', JSON.stringify({ status: keepAdding.current }));
    }


    const handleOpenSnackbar = () => {
        setSnackbarOpen(true);
    }

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
    
        setSnackbarOpen(false);
    };

    useEffect(() => {
        const keepAddStatus = JSON.parse(localStorage.getItem('keepAddingCards'))?.status;
        console.log('keepAddStatus:', keepAddStatus)
        if (keepAddStatus === true || keepAddStatus === false)
            keepAdding.current = keepAddStatus;
        else {
            localStorage.setItem('keepAddingCards', JSON.stringify({ status: false }));
            keepAdding.current = false;
        }
        setKeepAddLazy(keepAdding.current)
    })

    return (
        <Container>
            <TitleContainer>
                <TitleText>Crear nueva tarjeta</TitleText>
                <ConfigButton onClick={ handleOpenDialog }><MdSettings /></ConfigButton>
            </TitleContainer>
            <TitleUnderline />
            <Grid container>
                <Grid item xs={12} md={6}>
                    <Question>
                        <Subtitle>Pregunta</Subtitle>
                        <Editor ref={questionRef} placeholder={'Write something...'} />
                    </Question>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Answer>
                        <Subtitle>Respuesta</Subtitle>
                        <Editor ref={answerRef} placeholder={'Write something...'} />
                    </Answer>
                </Grid>
            </Grid>
            <ButtonsContainer>
                <SaveButton onClick={ handleNewCard }>Guardar</SaveButton>
                <CancelButton onClick={ returnToDeck }>Cancelar</CancelButton>
            </ButtonsContainer>

            <ConfigDialog 
                open={ openDialog } 
                handleClose={ handleCloseDialog } 
                title="Configuración" 
                keepAdding= { keepAdding.current }
                keepAddingHandle= { handleKeepAdding}
            />

            <CustomSnackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity={snackbarStatus.severity} sx={{ width: '100%' }}>
                    {snackbarStatus.message}
                </Alert>
            </CustomSnackbar>
        </Container>
    )
}

const Container = styled.div`
    padding: 2.5em;
`;

const TitleContainer = styled.div`
    display: flex;
    align-items: center;
`;


const ConfigButton = styled.div`
    &&& {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 1em;
        margin-top: -.3em;
        padding: 0em .75em;
        height: 3em;
        display: flex;
        border-radius: .75em;
        cursor: pointer;
        transition: 0.2s ease-in-out;
        svg {
            // margin-right: .4em;
            transition: 0.2s ease-in-out;
            font-size: 1.4rem;
            color: ${ inputSvgColor };
    
        }
        &:hover {
            background-color: ${ backgroundLightBlue };
            svg {
                color: ${ primaryBlue };
            }
        }
    }
`;

const TitleText = styled.h1`
    color: ${darkTextColor};
    font-weight: 600;
`;

const Subtitle = styled.h2`
    color: ${darkTextColor};
    font-weight: 600;
    margin-bottom: .35em;
`;

const TitleUnderline = styled.div`
    width: 0;
    padding: 0 0 .25em 2.5em;
    margin-top: -1em;
    margin-bottom: 1em;
    border-radius: 2em;
    background-color: ${primaryEmerald};
`;

const Question = styled.div`
	margin: 2em 0 0 0;
    @media (min-width: 960px) {
        margin: 1em 2em 0 0;
    }
`;

const Answer = styled.div`
    margin: 2em 0 0 0;
    @media (min-width: 960px) {
        margin: 1em 0 0 2em;
    }
`;

const ButtonsContainer = styled.div`
    display: flex;
    margin-top: 2em;
`;

const SaveButton = styled(Button)(() => ({
    '&&&': {
        display: 'flex',
        textTransform: 'none',
        fontFamily: '\'Khula\', \'Source Sans Pro\', sans-serif',
        fontSize: '1em',
        alignItems: 'center',
        justifyContent: 'center',
        height: '2.5em',
        backgroundColor: primaryEmerald,
        padding: '0 2em',
        marginRight: '1em',
        borderRadius: '.7em',
        fontWeight: 600,
        color: 'white',
        cursor: 'pointer',
        transition: '0.2s ease-in-out',
        '&:hover': {
            backgroundColor: primaryDarkEmerald,
        }
    }
}));

const CancelButton = styled(Button)(() => ({
    '&&&': {
        display: 'flex',
        textTransform: 'none',
        fontFamily: '\'Khula\', \'Source Sans Pro\', sans-serif',
        fontSize: '1em',
        alignItems: 'center',
        justifyContent: 'center',
        height: '2.5em',
        backgroundColor: primaryRed,
        padding: '0 2em',
        marginRight: '1em',
        borderRadius: '.7em',
        fontWeight: 600,
        color: 'white',
        cursor: 'pointer',
        transition: '0.2s ease-in-out',
        '&:hover': {
            backgroundColor: primaryRed2,
        }
    }
}));

const CustomSnackbar = styled(Snackbar)(() => ({
    '&&&': {
        '& .MuiPaper-root': {
            fontWeight: 600,
            color: 'white',
        },
        '& .MuiAlert-standardSuccess': {
            backgroundColor: primaryEmerald,
        },
        '& .MuiAlert-standardError': {
            backgroundColor: primaryRed,
        },
        '& .MuiAlert-icon': {
            color: 'white',
        },
    }
}));

export default NewCard
