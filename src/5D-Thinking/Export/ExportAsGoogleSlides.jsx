const capitalizeWords = (text = '') => {
    return text
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
const logoUrl = 'https://drive.google.com/uc?export=view&id=1WoF-kUTfs6mxgeXao2gmM9flISNLkbHT';

const dimensionColors = {
    Objectives: '0070C0',
    Explore: 'fa6666',
    Compare: '000000',
    Question: '64aae8',
    Connect: 'ffa600',
    Appreciate: '35b8b1',
    Activities: 'ffcccb',
  };
  
const titleSubtopicMap = {
    Objectives: ['Learning Objectives'],
    Explore: ['Content', 'Explanation', 'Observations', 'Fascinating Facts'],
    Compare: ['Analogy', 'Content', 'Explanation', 'Comparison'],
    Question: ['Negation of Chance', 'Negation of Material Causes', 'Negation of Nature', 'Conclusion'],
    Connect: ['Interdependency', 'Interconnectedness', "Allah's Names"],
    Appreciate: ['What ifs', 'Zikr Fikr Shukr', 'Character Lessons', 'Connect With Quran', 'Connect With Hadith', 'Dua'],
    Activities: ['Explore', 'Compare', 'Question', 'Connect', 'Appreciate'],
  };
  

// Function to create a new presentation
  const createPresentation = async (accessToken, title) => {
    const response = await fetch('https://slides.googleapis.com/v1/presentations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Error creating presentation: ${error.error.message}`);
    }

    const presentation = await response.json();
    return presentation.presentationId;
  };

// Updated updatePresentation function
const updatePresentation = async (presentationId, accessToken, slides) => {
  const requests = [];

  for (const [index, slideContent] of slides.entries()) {
    const dimension = slideContent.dimension;
    
    const pageObjectId = `slide_${index + 1}`;

  
    //  Handle "Objectives" Dimension (bullet list)
    // ─────────────────────────────────────────────
            // Handle "Activities" dimension
            if (dimension === 'Activities') {
              const activities = slideContent.activities || [];
        
              activities.forEach((activity, activityIndex) => {
                const activityPageObjectId = `activity_slide_${index}_${activityIndex}`;
        
                // 1) Create a new slide for each activity
                requests.push({
                  createSlide: {
                    objectId: activityPageObjectId,
                    insertionIndex: index + activityIndex, // Insert each activity sequentially
                  },
                });
        
                // 2) Set slide background color to white
                requests.push({
                  updatePageProperties: {
                    objectId: activityPageObjectId,
                    pageProperties: {
                      pageBackgroundFill: {
                        solidFill: {
                          color: {
                            rgbColor: { red: 1, green: 1, blue: 1 }, // White
                          },
                        },
                      },
                    },
                    fields: 'pageBackgroundFill.solidFill.color',
                  },
                });
        
                // 3) Create a title rectangle (header bar)
                const titleElementId = `title_${activityPageObjectId}`;
                requests.push({
                  createShape: {
                    objectId: titleElementId,
                    shapeType: 'RECTANGLE',
                    elementProperties: {
                      pageObjectId: activityPageObjectId,
                      size: {
                        height: { magnitude: 50, unit: 'PT' },
                        width: { magnitude: 600, unit: 'PT' },
                      },
                      transform: {
                        scaleX: 1,
                        scaleY: 1,
                        translateX: 50, // ~0.7 in from left
                        translateY: 20, // ~0.28 in from top
                        unit: 'PT',
                      },
                    },
                  },
                });
        
                // 4) Fill the rectangle with the dimension color
                requests.push({
                  updateShapeProperties: {
                    objectId: titleElementId,
                    shapeProperties: {
                      shapeBackgroundFill: {
                        solidFill: {
                          color: {
                            rgbColor: hexToRgb(dimensionColors[dimension] || '#000000'),
                          },
                        },
                      },
                    },
                    fields: 'shapeBackgroundFill.solidFill.color',
                  },
                });
        
                // 5) Insert the activity title text
                requests.push({
                  insertText: {
                    objectId: titleElementId,
                    insertionIndex: 0,
                    text: `Activity - ${activity.dimension}: ${activity.title}`,
                  },
                });
        
                // 6) Style the title text
                requests.push({
                  updateTextStyle: {
                    objectId: titleElementId,
                    style: {
                      fontSize: { magnitude: 25, unit: 'PT' },
                      bold: true,
                      foregroundColor: {
                        opaqueColor: {
                          rgbColor: { red: 1, green: 1, blue: 1 }, // White text
                        },
                      },
                    },
                    textRange: { type: 'ALL' },
                    fields: 'bold,fontSize,foregroundColor',
                  },
                });
        
                // 7) Add content for activity (Objective, Materials, Instructions)
                let yOffset = 100; // Start below the title bar
                const addContentText = (content, fontSize = 16, bold = false) => {
                  const contentElementId = `content_${activityPageObjectId}_${yOffset}`;
                  requests.push({
                    createShape: {
                      objectId: contentElementId,
                      shapeType: 'TEXT_BOX',
                      elementProperties: {
                        pageObjectId: activityPageObjectId,
                        size: {
                          height: { magnitude: 50, unit: 'PT' },
                          width: { magnitude: 600, unit: 'PT' },
                        },
                        transform: {
                          scaleX: 1,
                          scaleY: 1,
                          translateX: 50,
                          translateY: yOffset,
                          unit: 'PT',
                        },
                      },
                    },
                  });
        
                  requests.push({
                    insertText: {
                      objectId: contentElementId,
                      insertionIndex: 0,
                      text: content,
                    },
                  });
        
                  requests.push({
                    updateTextStyle: {
                      objectId: contentElementId,
                      style: {
                        fontSize: { magnitude: fontSize, unit: 'PT' },
                        bold,
                        foregroundColor: {
                          opaqueColor: { rgbColor: { red: 0, green: 0, blue: 0 } },
                        },
                      },
                      textRange: { type: 'ALL' },
                      fields: 'fontSize,bold,foregroundColor',
                    },
                  });
        
                  yOffset += 50; // Adjust Y offset for next content
                };
        
                // Add objective
                addContentText(`Objective: ${activity.objective}`, 18, true);
        
                // Add materials if available
                if (activity.materials?.length > 0) {
                  addContentText('Materials:', 16, true);
                  addContentText(activity.materials.join('\n'), 14);
                }
        
                // Add instructions if available
                if (activity.instructions?.length > 0) {
                  addContentText('Instructions:', 16, true);
                  addContentText(activity.instructions.join('\n'), 14);
                }

                // 8) Add your logo image
    const logoElementId = `logo_${activityPageObjectId}`;
    requests.push({
      createImage: {
        objectId: logoElementId,
        url: logoUrl,
        elementProperties: {
          pageObjectId: activityPageObjectId,
          size: {
            height: { magnitude: 50, unit: 'PT' },
            width: { magnitude: 50, unit: 'PT' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 600,
            translateY: 20,
            unit: 'PT',
          },
        },
      },
    });
              });
              continue;
              }

    // 1) Create a new slide
    requests.push({
      createSlide: {
        objectId: pageObjectId,
        insertionIndex: index,
      },
    });

    // 2) Set slide background color to white
    requests.push({
      updatePageProperties: {
        objectId: pageObjectId,
        pageProperties: {
          pageBackgroundFill: {
            solidFill: {
              color: {
                rgbColor: { red: 1, green: 1, blue: 1 }, // White
              },
            },
          },
        },
        fields: 'pageBackgroundFill.solidFill.color',
      },
    });

    // 3) Create a title rectangle (like a header bar)
    const titleElementId = `title_${pageObjectId}`;

    // Use the new subtopic logic:
    const subtopicTitle = `${dimension} - ${getSubtopicTitle(slideContent)}`;

    requests.push({
      createShape: {
        objectId: titleElementId,
        shapeType: 'RECTANGLE',
        elementProperties: {
          pageObjectId: pageObjectId,
          size: {
            height: { magnitude: 50, unit: 'PT' },
            width: { magnitude: 600, unit: 'PT' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 50,  // ~0.7 in from left
            translateY: 20,  // ~0.28 in from top
            unit: 'PT',
          },
        },
      },
    });

    // 4) Fill that rectangle using the dimension color
    requests.push({
      updateShapeProperties: {
        objectId: titleElementId,
        shapeProperties: {
          shapeBackgroundFill: {
            solidFill: {
              color: {
                rgbColor: hexToRgb(dimensionColors[dimension]),
              },
            },
          },
        },
        fields: 'shapeBackgroundFill.solidFill.color',
      },
    });

    // 5) Insert the slide title text
    requests.push({
      insertText: {
        objectId: titleElementId,
        insertionIndex: 0,
        text: subtopicTitle,
      },
    });

    // 6) Style the title text
    requests.push({
      updateTextStyle: {
        objectId: titleElementId,
        style: {
          fontSize: { magnitude: 30, unit: 'PT' },
          bold: true,
          foregroundColor: {
            opaqueColor: {
              rgbColor: { red: 1, green: 1, blue: 1 }, // White text
            },
          },
        },
        textRange: { type: 'ALL' },
        fields: 'bold,fontSize,foregroundColor',
      },
    });

    // 7) Center-align title text
    requests.push({
      updateParagraphStyle: {
        objectId: titleElementId,
        style: { alignment: 'CENTER' },
        textRange: { type: 'ALL' },
        fields: 'alignment',
      },
    });
              
    if (dimension === 'Objectives') {
      const lo = slideContent.learningObjectives || {};
      const bulletPoints = Object.values(lo).flat().filter((obj) => obj.trim() !== '');

      // Intro text
      const introElementId = `intro_${pageObjectId}`;
      requests.push({
        createShape: {
          objectId: introElementId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: pageObjectId,
            size: {
              height: { magnitude: 30, unit: 'PT' },
              width: { magnitude: 500, unit: 'PT' },
            },
            transform: {
              scaleX: 1,
              scaleY: 1,
              translateX: 50,
              translateY: 100, // below the title bar
              unit: 'PT',
            },
          },
        },
      });

      requests.push({
        insertText: {
          objectId: introElementId,
          insertionIndex: 0,
          text: 'After this lesson, learners will be able to:',
        },
      });

      requests.push({
        updateTextStyle: {
          objectId: introElementId,
          style: {
            fontSize: { magnitude: 18, unit: 'PT' },
            bold: true,
            foregroundColor: {
              opaqueColor: { rgbColor: { red: 0, green: 0, blue: 0 } }, // black
            },
          },
          textRange: { type: 'ALL' },
          fields: 'bold,fontSize,foregroundColor',
        },
      });

      // Bullet points
      if (bulletPoints.length > 0) {
        const bulletsElementId = `objectivesBullets_${pageObjectId}`;
        requests.push({
          createShape: {
            objectId: bulletsElementId,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: pageObjectId,
              size: {
                height: { magnitude: 250, unit: 'PT' },
                width: { magnitude: 500, unit: 'PT' },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 50,
                translateY: 140,
                unit: 'PT',
              },
            },
          },
        });

        requests.push({
          insertText: {
            objectId: bulletsElementId,
            insertionIndex: 0,
            text: bulletPoints.join('\n'),
          },
        });

        requests.push({
          updateTextStyle: {
            objectId: bulletsElementId,
            style: {
              fontSize: { magnitude: 16, unit: 'PT' },
              foregroundColor: {
                opaqueColor: { rgbColor: { red: 0, green: 0, blue: 0 } }, // black
              },
            },
            textRange: { type: 'ALL' },
            fields: 'fontSize,foregroundColor',
          },
        });

        requests.push({
          createParagraphBullets: {
            objectId: bulletsElementId,
            textRange: { type: 'ALL' },
            bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE',
          },
        });
      } else {
        // fallback text if no objectives
        const fallbackId = `fallback_${pageObjectId}`;
        requests.push({
          createShape: {
            objectId: fallbackId,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: pageObjectId,
              size: {
                height: { magnitude: 50, unit: 'PT' },
                width: { magnitude: 500, unit: 'PT' },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 50,
                translateY: 140,
                unit: 'PT',
              },
            },
          },
        });
        requests.push({
          insertText: {
            objectId: fallbackId,
            insertionIndex: 0,
            text: 'No learning objectives available.',
          },
        });
      }

    } else {
      // ──────────────────────────────────────────────────────────
      //  Handle "Appreciate" for Quran/Hadith/Dua OR fallback text
      // ──────────────────────────────────────────────────────────

      // 3a) If dimension=Appreciate && connectWithQuran
      if (dimension === 'Appreciate' && slideContent.connectWithQuran) {
        const appreciateElementId = `appreciateQuran_${pageObjectId}`;

        // Ensure we have an array
        const quranItems = Array.isArray(slideContent.connectWithQuran)
          ? slideContent.connectWithQuran
          : [slideContent.connectWithQuran];

        // Build a single big string from all connectWithQuran items
        const quranTextArr = quranItems.map(({ verse, translation, explanation }) => {
          return (
            `Verse:\n${verse}\n\n` +
            `Translation:\n"${translation}"\n\n` +
            `Explanation:\n${explanation}\n\n`
          );
        });

        // If there's a dua, append it
        let duaText = '';
        if (slideContent.dua && slideContent.dua.trim().length > 0) {
          duaText = `Dua:\n${slideContent.dua}\n`;
        }

        requests.push({
          createShape: {
            objectId: appreciateElementId,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: pageObjectId,
              size: {
                height: { magnitude: 350, unit: 'PT' },
                width: { magnitude: 600, unit: 'PT' },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 50,
                translateY: 100,
                unit: 'PT',
              },
            },
          },
        });

        requests.push({
          insertText: {
            objectId: appreciateElementId,
            insertionIndex: 0,
            text: quranTextArr.join('') + duaText,
          },
        });

        requests.push({
          updateTextStyle: {
            objectId: appreciateElementId,
            style: {
              fontSize: { magnitude: 20, unit: 'PT' },
              foregroundColor: {
                opaqueColor: { rgbColor: { red: 0, green: 0, blue: 0 } },
              },
            },
            textRange: { type: 'ALL' },
            fields: 'fontSize,foregroundColor',
          },
        });

        // Left-align paragraphs
        requests.push({
          updateParagraphStyle: {
            objectId: appreciateElementId,
            style: { alignment: 'START' },
            textRange: { type: 'ALL' },
            fields: 'alignment',
          },
        });

      // 3b) If dimension=Appreciate && connectWithHadith
      } else if (dimension === 'Appreciate' && slideContent.connectWithHadith) {
        const appreciateElementId = `appreciateHadith_${pageObjectId}`;

        // Ensure we have an array
        const hadithItems = Array.isArray(slideContent.connectWithHadith)
          ? slideContent.connectWithHadith
          : [slideContent.connectWithHadith];

        // Build a single big string from all connectWithHadith items
        const hadithTextArr = hadithItems.map(({ hadith, explanation }) => {
          return (
            `Hadith:\n"${hadith}"\n\n` +
            `Explanation:\n${explanation}\n\n`
          );
        });

        // If there's a dua, append it
        let duaText = '';
        if (slideContent.dua && slideContent.dua.trim().length > 0) {
          duaText = `Dua:\n${slideContent.dua}\n`;
        }

        requests.push({
          createShape: {
            objectId: appreciateElementId,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: pageObjectId,
              size: {
                height: { magnitude: 350, unit: 'PT' },
                width: { magnitude: 600, unit: 'PT' },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 50,
                translateY: 100,
                unit: 'PT',
              },
            },
          },
        });

        requests.push({
          insertText: {
            objectId: appreciateElementId,
            insertionIndex: 0,
            text: hadithTextArr.join('') + duaText,
          },
        });

        requests.push({
          updateTextStyle: {
            objectId: appreciateElementId,
            style: {
              fontSize: { magnitude: 20, unit: 'PT' },
              foregroundColor: {
                opaqueColor: { rgbColor: { red: 0, green: 0, blue: 0 } },
              },
            },
            textRange: { type: 'ALL' },
            fields: 'fontSize,foregroundColor',
          },
        });

        // Left-align paragraphs
        requests.push({
          updateParagraphStyle: {
            objectId: appreciateElementId,
            style: { alignment: 'START' },
            textRange: { type: 'ALL' },
            fields: 'alignment',
          },
        });

      // 3c) If dimension=Appreciate && only "dua"
      } else if (dimension === 'Appreciate' && slideContent.dua) {
        const duaElementId = `appreciateDua_${pageObjectId}`;

        requests.push({
          createShape: {
            objectId: duaElementId,
            shapeType: 'TEXT_BOX',
            elementProperties: {
              pageObjectId: pageObjectId,
              size: {
                height: { magnitude: 350, unit: 'PT' },
                width: { magnitude: 600, unit: 'PT' },
              },
              transform: {
                scaleX: 1,
                scaleY: 1,
                translateX: 50,
                translateY: 100,
                unit: 'PT',
              },
            },
          },
        });

        requests.push({
          insertText: {
            objectId: duaElementId,
            insertionIndex: 0,
            text: `Dua:\n${slideContent.dua}`,
          },
        });

        requests.push({
          updateTextStyle: {
            objectId: duaElementId,
            style: {
              fontSize: { magnitude: 20, unit: 'PT' },
              foregroundColor: {
                opaqueColor: { rgbColor: { red: 0, green: 0, blue: 0 } },
              },
            },
            textRange: { type: 'ALL' },
            fields: 'fontSize,foregroundColor',
          },
        });

        requests.push({
          updateParagraphStyle: {
            objectId: duaElementId,
            style: { alignment: 'START' },
            textRange: { type: 'ALL' },
            fields: 'alignment',
          },
        });

      // ─────────────────────────────────────────────
      //  Otherwise, handle normal content or table
      // ─────────────────────────────────────────────
      } else {
        const contentText = getContentText(slideContent);

        // If generic contentText is non-empty
        if (contentText && contentText.trim() !== '') {
          const contentElementId = `content_${pageObjectId}`;
          requests.push({
            createShape: {
              objectId: contentElementId,
              shapeType: 'TEXT_BOX',
              elementProperties: {
                pageObjectId: pageObjectId,
                size: {
                  height: { magnitude: 350, unit: 'PT' },
                  width: { magnitude: 600, unit: 'PT' },
                },
                transform: {
                  scaleX: 1,
                  scaleY: 1,
                  translateX: 50,
                  translateY: 100,
                  unit: 'PT',
                },
              },
            },
          });

          requests.push({
            insertText: {
              objectId: contentElementId,
              insertionIndex: 0,
              text: contentText,
            },
          });

          // Style the content text
          requests.push({
            updateTextStyle: {
              objectId: contentElementId,
              style: {
                fontSize: { magnitude: 20, unit: 'PT' },
                foregroundColor: {
                  opaqueColor: { rgbColor: { red: 0, green: 0, blue: 0 } },
                },
              },
              textRange: { type: 'ALL' },
              fields: 'fontSize,foregroundColor',
            },
          });

          // Center align (as per your original code)
          requests.push({
            updateParagraphStyle: {
              objectId: contentElementId,
              style: { alignment: 'CENTER' },
              textRange: { type: 'ALL' },
              fields: 'alignment',
            },
          });
        } else {
          // If we have no contentText, check for Connect or Appreciate tables
          if (dimension === 'Connect' && slideContent.allahNames) {
            // Create a table for Allah's Names
            const tableElementId = `table_${pageObjectId}`;
            const { whatItTells, namesInEnglish, namesInArabic } = slideContent.allahNames;

            const numRows = namesInEnglish.length + 1; // +1 for header
            requests.push({
              createTable: {
                objectId: tableElementId,
                elementProperties: {
                  pageObjectId: pageObjectId,
                  size: {
                    height: { magnitude: 300, unit: 'PT' },
                    width: { magnitude: 600, unit: 'PT' },
                  },
                  transform: {
                    scaleX: 1,
                    scaleY: 1,
                    translateX: 50,
                    translateY: 100,
                    unit: 'PT',
                  },
                },
                rows: numRows,
                columns: 3,
              },
            });

            // Insert header row
            const headerCells = [
              'What it tells us about Allah',
              'Names in English',
              'Names in Arabic',
            ];
            for (let col = 0; col < 3; col++) {
              requests.push(
                ...insertTableCellTextAndStyle(
                  tableElementId,
                  0,
                  col,
                  headerCells[col],
                  true // isHeader
                )
              );
            }

            // Insert data rows
            for (let row = 1; row < numRows; row++) {
              const data = [
                whatItTells[row - 1] || '',
                namesInEnglish[row - 1] || '',
                namesInArabic[row - 1] || '',
              ];
              for (let col = 0; col < 3; col++) {
                requests.push(
                  ...insertTableCellTextAndStyle(
                    tableElementId,
                    row,
                    col,
                    data[col],
                    false // isHeader
                  )
                );
              }
            }
          } else if (dimension === 'Appreciate' && slideContent.zikrFikrShukr) {
            // Table for Zikr Fikr Shukr
            const tableElementId = `table_${pageObjectId}`;
            const { zikr, fikr, shukr } = slideContent.zikrFikrShukr;

            const numRows = zikr.length + 1; // +1 for header
            requests.push({
              createTable: {
                objectId: tableElementId,
                elementProperties: {
                  pageObjectId: pageObjectId,
                  size: {
                    height: { magnitude: 300, unit: 'PT' },
                    width: { magnitude: 600, unit: 'PT' },
                  },
                  transform: {
                    scaleX: 1,
                    scaleY: 1,
                    translateX: 50,
                    translateY: 100,
                    unit: 'PT',
                  },
                },
                rows: numRows,
                columns: 3,
              },
            });

            // Insert header row
            const headerCells = ['Zikr', 'Fikr', 'Shukr'];
            for (let col = 0; col < 3; col++) {
              requests.push(
                ...insertTableCellTextAndStyle(
                  tableElementId,
                  0,
                  col,
                  headerCells[col],
                  true
                )
              );
            }

            // Insert data rows
            for (let row = 1; row < numRows; row++) {
              const data = [zikr[row - 1], fikr[row - 1], shukr[row - 1]];
              for (let col = 0; col < 3; col++) {
                requests.push(
                  ...insertTableCellTextAndStyle(
                    tableElementId,
                    row,
                    col,
                    data[col],
                    false
                  )
                );
              }
            }
          }
        }
      }
    }

    // 8) Add your logo image
    const logoElementId = `logo_${pageObjectId}`;
    requests.push({
      createImage: {
        objectId: logoElementId,
        url: logoUrl,
        elementProperties: {
          pageObjectId: pageObjectId,
          size: {
            height: { magnitude: 50, unit: 'PT' },
            width: { magnitude: 50, unit: 'PT' },
          },
          transform: {
            scaleX: 1,
            scaleY: 1,
            translateX: 600,
            translateY: 20,
            unit: 'PT',
          },
        },
      },
    });
  } // end for-of

  // Finally, send the batch update
  const response = await fetch(
    `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ requests }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error updating presentation: ${error.error.message}`);
  }
};


  // Helper function to insert text and style a table cell
  const insertTableCellTextAndStyle = (
    tableElementId,
    rowIndex,
    columnIndex,
    text,
    isHeader = false,
    dataRowIndex = null
  ) => {
    const requests = [];

    // Insert text into cell
    requests.push({
      insertText: {
        objectId: tableElementId,
        cellLocation: { rowIndex, columnIndex },
        insertionIndex: 0,
        text: text || '',
      },
    });

    // Style text
    requests.push({
      updateTextStyle: {
        objectId: tableElementId,
        cellLocation: { rowIndex, columnIndex },
        style: {
          bold: isHeader,
          fontSize: { magnitude: isHeader ? 14 : 12, unit: 'PT' },
          foregroundColor: {
            opaqueColor: {
              rgbColor: { red: 0, green: 0, blue: 0 }, // Black text
            },
          },
        },
        textRange: { type: 'ALL' },
        fields: 'bold,fontSize,foregroundColor',
      },
    });

    // Set cell background color
    let backgroundColor;
    if (isHeader) {
      backgroundColor = { red: 0.9, green: 0.9, blue: 0.9 }; // Light gray
    } else {
      backgroundColor = { red: 0.9, green: 0.9, blue: 0.9 }; // Light gray for body cells
    }

    requests.push({
      updateTableCellProperties: {
        objectId: tableElementId,
        tableRange: {
          location: { rowIndex, columnIndex },
          rowSpan: 1,
          columnSpan: 1,
        },
        tableCellProperties: {
          tableCellBackgroundFill: {
            solidFill: {
              color: {
                rgbColor: backgroundColor,
              },
            },
          },
        },
        fields: 'tableCellBackgroundFill.solidFill.color',
      },
    });

    // Align text in cell
    requests.push({
      updateParagraphStyle: {
        objectId: tableElementId,
        cellLocation: { rowIndex, columnIndex },
        style: {
          alignment: 'CENTER',
        },
        textRange: { type: 'ALL' },
        fields: 'alignment',
      },
    });

    return requests;
  };


  // Helper function to convert hex color to rgb object
  const hexToRgb = (hex) => {
    const bigint = parseInt(hex, 16);
    return {
      red: ((bigint >> 16) & 255) / 255,
      green: ((bigint >> 8) & 255) / 255,
      blue: (bigint & 255) / 255,
    };
  };

  const getSubtopicTitle = (slideContent) => {
    const dimension = slideContent.dimension;
    const subtopics = titleSubtopicMap[dimension];
    const subtopicIndex = slideContent.subtopicIndex || 0;
    return subtopics[subtopicIndex] || 'Output';
  };

  const getContentText = (slideContent) => {
    if (slideContent.dimension === 'Objectives') {
      // Convert the `learningObjectives` object into a bullet list of categories and items
      const lo = slideContent.learningObjectives || {};
      let bulletString = '';
      for (const [category, items] of Object.entries(lo)) {
        bulletString += `${capitalizeWords(category)}:\n`;
        items.forEach((obj) => {
          bulletString += ` - ${obj}\n`;
        });
        bulletString += '\n';
      }
      return bulletString;
    }
  
  if (slideContent.dimension === 'Question') {
    // If it's one of the first 3 subtopics, we have questions (an array)
    if (
      slideContent.subtopicIndex < 3 &&
      Array.isArray(slideContent.questions) &&
      slideContent.questions.length > 0
    ) {
      // Join them with newline so it looks like bullet points in a text box
      return slideContent.questions.join('\n');
    }
    // If it's subtopicIndex 3, it's the conclusion
    if (slideContent.subtopicIndex === 3 && slideContent.conclusion) {
      // Prepend a label if you want
      return  slideContent.conclusion;
    }
  }

// Check for other keys
const keys = Object.keys(slideContent);
for (const key of keys) {
  // Skip dimension, subtopicIndex, questionCategory, questions already handled
  if (
    ['dimension', 'subtopicIndex', 'questionCategory', 'questions', 'allahNames', 'zikrFikrShukr'].includes(key)
  ) {
    continue;
  }
  if (slideContent[key]) {
    if (Array.isArray(slideContent[key])) {
      return slideContent[key].join('\n');
    } else if (typeof slideContent[key] === 'string') {
      return slideContent[key];
    }
  }
}
return '';
};

export {
    createPresentation,
    updatePresentation,
    insertTableCellTextAndStyle,
    hexToRgb,
    getSubtopicTitle,
    getContentText,
  };
  