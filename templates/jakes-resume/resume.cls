%-------------------------------------------------------------------------------
%                Template LaTeX Class File
%-------------------------------------------------------------------------------

\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{resume}[2024/01/01 v1.0 Resume Class]

\LoadClass[11pt,letterpaper]{article}

%-------------------------------------------------------------------------------
%                Commands for personal information
%-------------------------------------------------------------------------------

% Name
\newcommand{\name}[1]{\def\@name{#1}}
\newcommand{\@name}{}

% Email
\newcommand{\email}[1]{\def\@email{#1}}
\newcommand{\@email}{}

% Phone
\newcommand{\phone}[1]{\def\@phone{#1}}
\newcommand{\@phone}{}

% Location
\newcommand{\location}[1]{\def\@location{#1}}
\newcommand{\@location}{}

% LinkedIn
\newcommand{\linkedin}[1]{\def\@linkedin{#1}}
\newcommand{\@linkedin}{}

% GitHub
\newcommand{\github}[1]{\def\@github{#1}}
\newcommand{\@github}{}

% Website
\newcommand{\website}[1]{\def\@website{#1}}
\newcommand{\@website}{}

%-------------------------------------------------------------------------------
%                Page setup
%-------------------------------------------------------------------------------

\usepackage[left=0.5in,top=0.5in,right=0.5in,bottom=0.5in]{geometry}
\usepackage{hyperref}
\usepackage{fontawesome5}
\usepackage{enumitem}
\usepackage{titlesec}

%-------------------------------------------------------------------------------
%                Formatting
%-------------------------------------------------------------------------------

% Remove page numbers
\pagestyle{empty}

% Section formatting
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

%-------------------------------------------------------------------------------
%                Custom commands
%-------------------------------------------------------------------------------

% Header with name and contact info
\newcommand{\resumeHeader}{
  \begin{center}
    {\Huge\bfseries\@name}\\[0.5em]
    \small
    \ifx\@email\empty\else\faEnvelope\ \href{mailto:\@email}{\@email}\quad\fi
    \ifx\@phone\empty\else\faPhone\ \@phone\quad\fi
    \ifx\@location\empty\else\faMapMarker\ \@location\quad\fi
    \ifx\@linkedin\empty\else\faLinkedin\ \href{https://linkedin.com/in/\@linkedin}{\@linkedin}\quad\fi
    \ifx\@github\empty\else\faGithub\ \href{https://github.com/\@github}{\@github}\quad\fi
    \ifx\@website\empty\else\faGlobe\ \href{\@website}{\@website}\fi
  \end{center}
  \vspace{-10pt}
}

% Resume subheading (for experience/education entries)
\newcommand{\resumeSubheading}[4]{
  \vspace{-1pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-5pt}
}

% Resume subheading with location
\newcommand{\resumeSubheadingWithLocation}[5]{
  \vspace{-1pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
      \textit{\small#5} & \\
    \end{tabular*}\vspace{-5pt}
}

% Resume item list start
\newcommand{\resumeItemListStart}{
  \begin{itemize}[leftmargin=0.15in, labelsep=0.05in]
}

% Resume item list end
\newcommand{\resumeItemListEnd}{
  \end{itemize}
}

% Resume item (bullet point)
\newcommand{\resumeItem}[1]{
  \item\small{#1 \vspace{-2pt}}
}

% Resume subitem (for skills)
\newcommand{\resumeSubItem}[2]{
  \item\small{\textbf{#1}{: #2 \vspace{-2pt}}}
}

% Resume project heading
\newcommand{\resumeProjectHeading}[4]{
  \vspace{-1pt}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
      \textbf{#1} & #2 \\
      \textit{\small#3} & \textit{\small #4} \\
    \end{tabular*}\vspace{-5pt}
}

%-------------------------------------------------------------------------------
%                End of class file
%-------------------------------------------------------------------------------

